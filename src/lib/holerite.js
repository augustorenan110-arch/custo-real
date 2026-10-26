import { jsPDF } from 'jspdf';
import logoCr from '@/assets/logo-cr.png';
import { dateBR } from '@/lib/format';

/* Holerite em bobina: 140 x 100 mm (paisagem), no modelo do recibo de salário. */
const LARGURA = 140;
const ALTURA = 100;
const HORAS_MES = 220;
const X = 5;
const LARGURA_TABELA = 102;
const VENC = 96;
const DESC = 106;

let logoBase64 = null;

async function carregarLogo() {
  if (logoBase64) return logoBase64;
  const resposta = await fetch(logoCr);
  const blob = await resposta.blob();
  logoBase64 = await new Promise((ok, erro) => {
    const leitor = new FileReader();
    leitor.onload = () => ok(leitor.result);
    leitor.onerror = () => erro(new Error('Não foi possível ler o logo CR.'));
    leitor.readAsDataURL(blob);
  });
  return logoBase64;
}

const dinheiro = (n) => (Number(n) || 0).toFixed(2).replace('.', ',');
const proporcao = (valor, base) => (base > 0 ? dinheiro((valor / base) * 100) : '0,00');

const ultimoDia = (mes) => {
  const [ano, m] = String(mes || '').split('-').map(Number);
  if (!ano || !m) return '';
  const dia = new Date(ano, m, 0).getDate();
  return dateBR(`${ano}-${String(m).padStart(2, '0')}-${String(dia).padStart(2, '0')}`);
};

/** Lançamentos puxados do cálculo automático (mesmos valores da folha do mês). */
function lancamentos(slip, valorHora) {
  const vencimentos = slip.earnings.map((e) =>
    String(e.label).startsWith('Horas extras')
      ? {
          cod: '0002',
          desc: 'Hora Extra 50%',
          quant: dinheiro(e.value / (valorHora * 1.5)),
          ref: 'HORAS',
          base: valorHora * 1.5,
          valor: e.value,
          desconto: false,
        }
      : {
          cod: '0001',
          desc: 'Horas Normais',
          quant: `${HORAS_MES},00`,
          ref: 'HORAS',
          base: valorHora,
          valor: e.value,
          desconto: false,
        },
  );

  const descontos = slip.deductions.map((d) => {
    if (d.label === 'INSS')
      return { cod: '0998', desc: 'I.n.s.s.', quant: proporcao(d.value, slip.base), ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    if (d.label === 'IRRF')
      return { cod: '0561', desc: 'I.r.r.f.', quant: proporcao(d.value, slip.base), ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    if (String(d.label).startsWith('Vale-transporte'))
      return { cod: '0930', desc: 'Vale Transporte', quant: '6,00', ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    return { cod: '0100', desc: 'Faltas N/ Justif.', quant: '', ref: 'DIAS', base: 0, valor: d.value, desconto: true };
  });

  return [...vencimentos, ...descontos];
}

export async function holeritePdf({ company, employee, month, slip }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [LARGURA, ALTURA] });
  const nome = String(employee.full_name || 'Colaborador').toUpperCase();
  const salario = Number(employee.salary) || 0;
  const valorHora = salario / HORAS_MES;
  const logo = await carregarLogo().catch(() => null);

  // ── Cabeçalho ──────────────────────────────────────────────────────────────
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${company?.cnpj || '—'}`, X, 8);

  doc.setDrawColor(150);
  doc.rect(X, 10, 20, 20);
  if (logo) doc.addImage(logo, 'PNG', 6, 11, 18, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(String(company?.name || 'Empresa').toUpperCase(), 27, 13);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(String(company?.activity || '').slice(0, 58), 27, 16);
  doc.text(`CNPJ: ${company?.cnpj || '—'}`, 27, 19);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Recibo de Pagto. de Salário', X + LARGURA_TABELA, 13, { align: 'right' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folha Mensal ${ultimoDia(month)}`, X + LARGURA_TABELA, 19, { align: 'right' });

  // ── Dados do funcionário ──────────────────────────────────────────────────
  doc.rect(27, 21, 80, 12);
  doc.text(`0002 ${nome}`, 28, 24);
  doc.text(`CPF: ${employee.cpf || '—'}    Admissão: ${employee.admission_date ? dateBR(employee.admission_date) : '—'}`, 28, 27);
  doc.text(`Local: ${employee.unit || '0001 GERAL'}   Cargo: ${employee.role_title || '—'}`, 28, 30);

  // ── Tabela de vencimentos e descontos ────────────────────────────────────
  const topo = 35;
  doc.setFillColor(180, 180, 180);
  doc.rect(X, topo, LARGURA_TABELA, 6, 'F');
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.text('Data', 6, topo + 4);
  doc.text('Código', 13, topo + 4);
  doc.text('Descrição', 21, topo + 4);
  doc.text('Quant/%', 55, topo + 4);
  doc.text('Ref.', 64, topo + 4);
  doc.text('Base', 73, topo + 4);
  doc.text('Vencim.', VENC, topo + 4, { align: 'right' });
  doc.text('Desc.', DESC, topo + 4, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  const linhas = lancamentos(slip, valorHora);
  const altura = Math.min(3.6, 21 / Math.max(linhas.length, 1));
  let y = topo + 8;
  let totalVenc = 0;
  let totalDesc = 0;

  linhas.forEach((l) => {
    if (l.desconto) {
      totalDesc += l.valor;
    } else {
      totalVenc += l.valor;
    }
    doc.text('30', 6, y);
    doc.text(l.cod, 13, y);
    doc.text(l.desc, 21, y);
    doc.text(l.quant, 62, y, { align: 'right' });
    doc.text(l.ref, 69, y, { align: 'right' });
    doc.text(l.base ? dinheiro(l.base) : '', 86, y, { align: 'right' });
    doc.text(l.desconto ? '' : dinheiro(l.valor), VENC, y, { align: 'right' });
    doc.text(l.desconto ? dinheiro(l.valor) : '', DESC, y, { align: 'right' });
    y += altura;
  });

  // ── Totais ────────────────────────────────────────────────────────────────
  const tot = 65;
  doc.rect(X, tot, LARGURA_TABELA, 10);
  doc.text('Total de Vencimentos', 8, tot + 4);
  doc.text(dinheiro(totalVenc), 62, tot + 4, { align: 'right' });
  doc.text('Total de Descontos', 66, tot + 4);
  doc.text(dinheiro(totalDesc), DESC, tot + 4, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('Valor Líquido =>', 8, tot + 8);
  doc.text(dinheiro(totalVenc - totalDesc), DESC, tot + 8, { align: 'right' });

  // ── Bases de cálculo ──────────────────────────────────────────────────────
  const inss = slip.deductions.find((d) => d.label === 'INSS')?.value || 0;
  const rodape = 78;
  doc.setFillColor(180, 180, 180);
  doc.rect(X, rodape, LARGURA_TABELA, 6, 'F');
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'bold');
  const rotulos = [
    ['Salário Base', 7],
    ['Sal. Contr. INSS', 26],
    ['Base FGTS', 46],
    ['FGTS do Mês', 60],
    ['Base IRRF', 76],
    ['Via do Empregado', 88],
  ];
  rotulos.forEach(([rotulo, x]) => doc.text(rotulo, x, rodape + 4));
  doc.rect(X, rodape + 6, LARGURA_TABELA, 6);
  doc.setFont('helvetica', 'normal');
  const valores = [
    [dinheiro(salario), 7],
    [dinheiro(slip.base), 26],
    [dinheiro(slip.base), 46],
    [dinheiro(slip.fgts), 60],
    [dinheiro(Math.max(0, slip.base - inss)), 76],
    [dinheiro(slip.net), 88],
  ];
  valores.forEach(([valor, x]) => doc.text(valor, x, rodape + 10));

  // ── Assinatura lateral ────────────────────────────────────────────────────
  doc.setFontSize(5);
  doc.text('Declaro ter recebido a importância líquida discriminada neste recibo.', 113, 90, { angle: 90 });
  doc.line(120, 44, 120, 62);
  doc.text(nome, 123, 60, { angle: 90 });
  doc.text(`${new Date().toLocaleDateString('pt-BR')}  Data`, 130, 60, { angle: 90 });

  doc.save(`holerite-${String(employee.full_name || 'colaborador').replace(/\s+/g, '_')}-${month}.pdf`);
}