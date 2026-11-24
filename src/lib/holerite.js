import { jsPDF } from 'jspdf';
import logoCr from '@/assets/logo-cr.png';
import { dateBR, cnpjBR, cpfBR } from '@/lib/format';
import { calculateCustoReal } from '@/lib/payroll';

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

const round = (n) => Math.round((Number(n) || 0) * 100) / 100;
const dinheiro = (n) => (Number(n) || 0).toFixed(2).replace('.', ',');
const real = (n) => `R$ ${dinheiro(n)}`;
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

  // Linhas zeradas obrigatórias (sempre presentes, mesmo que 0,00).
  const temExtra = slip.earnings.some((e) => String(e.label).startsWith('Horas extras'));
  if (!temExtra) {
    vencimentos.push({
      cod: '0002',
      desc: 'Hora Extra 50%',
      quant: '0,00',
      ref: 'HORAS',
      base: valorHora * 1.5,
      valor: 0,
      desconto: false,
    });
  }
  vencimentos.push({
    cod: '0003',
    desc: 'Adicional Noturno',
    quant: '0,00',
    ref: 'HORAS',
    base: valorHora,
    valor: 0,
    desconto: false,
  });

  const descontos = slip.deductions.map((d) => {
    if (d.label === 'INSS')
      return { cod: '0998', desc: 'INSS', quant: proporcao(d.value, slip.base), ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    if (d.label === 'IRRF')
      return { cod: '0561', desc: 'IRRF', quant: proporcao(d.value, slip.base), ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    if (String(d.label).startsWith('Vale-transporte'))
      return { cod: '0930', desc: 'Vale Transporte', quant: '6,00', ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    return { cod: '0100', desc: 'Faltas N/ Justif.', quant: '', ref: 'DIAS', base: 0, valor: d.value, desconto: true };
  });

  const temVt = slip.deductions.some((d) => String(d.label).startsWith('Vale-transporte'));
  if (!temVt) {
    descontos.push({
      cod: '0930',
      desc: 'Vale Transporte',
      quant: '0,00',
      ref: 'VALOR',
      base: slip.base,
      valor: 0,
      desconto: true,
    });
  }

  return [...vencimentos, ...descontos];
}

export async function holeritePdf({ company, employee, month, slip }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [LARGURA, ALTURA] });
  const nome = String(employee.full_name || 'Colaborador').toUpperCase();
  const salario = Number(employee.salary) || 0;
  const valorHora = salario / HORAS_MES;
  const logo = await carregarLogo().catch(() => null);
  const local = company?.cidade_uf || 'Matriz';
  const dataFolha = ultimoDia(month);

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
  doc.text(`Folha Mensal ${dataFolha}`, X + LARGURA_TABELA, 19, { align: 'right' });

  // ── Dados do funcionário ──────────────────────────────────────────────────
  doc.rect(27, 21, 80, 12);
  doc.text(`0002 ${nome}`, 28, 24);
  doc.text(`CPF: ${employee.cpf || '—'}    Admissão: ${employee.admission_date ? dateBR(employee.admission_date) : '—'}`, 28, 27);
  doc.text(`Local: ${local}   Cargo: ${employee.role_title || '—'}`, 28, 30);

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
    doc.text(l.base ? real(l.base) : '', 86, y, { align: 'right' });
    doc.text(l.desconto ? '' : real(l.valor), VENC, y, { align: 'right' });
    doc.text(l.desconto ? real(l.valor) : '', DESC, y, { align: 'right' });
    y += altura;
  });

  // ── Totais ────────────────────────────────────────────────────────────────
  const tot = 65;
  doc.rect(X, tot, LARGURA_TABELA, 10);
  doc.text('Total de Vencimentos', 8, tot + 4);
  doc.text(real(totalVenc), 62, tot + 4, { align: 'right' });
  doc.text('Total de Descontos', 66, tot + 4);
  doc.text(real(totalDesc), DESC, tot + 4, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('Valor Líquido =>', 8, tot + 8);
  doc.text(real(totalVenc - totalDesc), DESC, tot + 8, { align: 'right' });

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
    [real(salario), 7],
    [real(slip.base), 26],
    [real(slip.base), 46],
    [real(slip.fgts), 60],
    [real(Math.max(0, slip.base - inss)), 76],
    [real(slip.net), 88],
  ];
  valores.forEach(([valor, x]) => doc.text(valor, x, rodape + 10));

  // ── Página 2: Custo Real + Rodapé profissional ─────────────────────────────
  // Fórmula oficial única (calculateCustoReal): Salário Base + INSS Patronal +
  // FGTS + Provisão Férias/1/3 + Provisão 13º. Mesmo valor do Painel e Relatório.
  doc.addPage([140, 118], 'landscape');
  const custoReal = calculateCustoReal(salario);
  const custoTotal = custoReal.total;
  const alemSalarioBase = round(custoTotal - salario);

  // Título em azul
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(X, 6, 130, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTO REAL PARA A EMPRESA - DIFERENCIAL GR', 8, 11);

  // Linha informativa do líquido (fora da soma do custo real)
  doc.setTextColor(90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Salário Líquido pago ao funcionário: ${real(slip.net)}`, 8, 20);

  // Quadro de custos (soma = Custo Total Real)
  doc.setFillColor(238, 244, 255);
  doc.roundedRect(X, 23, 130, 36, 1.5, 1.5, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.3);
  doc.roundedRect(X, 23, 130, 36, 1.5, 1.5, 'S');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const linhasCusto = [
    ['Salário Base:', real(custoReal.salarioBase)],
    ['+ INSS Patronal:', real(custoReal.inssPatronal)],
    ['+ FGTS:', real(custoReal.fgts)],
    ['+ Provisão Férias + 1/3 + 13º:', real(custoReal.provisoes)],
  ];
  let yc = 29;
  for (const [rotulo, valor] of linhasCusto) {
    doc.text(rotulo, 8, yc);
    doc.text(valor, 132, yc, { align: 'right' });
    yc += 5.5;
  }
  doc.setDrawColor(59, 130, 246);
  doc.line(8, yc - 1.5, 132, yc - 1.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('= CUSTO TOTAL REAL:', 8, yc + 3);
  doc.text(real(custoTotal), 132, yc + 3, { align: 'right' });

  // Destaque "além do salário base"
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(X, yc + 7, 130, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Você paga ${real(alemSalarioBase)} além do salário base de ${real(salario)}`, 8, yc + 12.5);

  // ── Declaração horizontal (fonte 10) ────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Declaro ter recebido a importância líquida discriminada neste recibo.', 8, yc + 24);

  // ── Rodapé profissional (assinaturas) ──────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  const yAss = yc + 34;
  // Funcionário
  doc.setDrawColor(120);
  doc.line(8, yAss, 66, yAss);
  doc.text('Assinatura do funcionário', 8, yAss + 4);
  doc.text(`${nome} - CPF: ${cpfBR(employee.cpf)} - Data: _____/_____/______`, 8, yAss + 8);
  // Empregador
  doc.line(74, yAss, 132, yAss);
  doc.text('Assinatura do empregador', 74, yAss + 4);
  doc.text(
    `${String(company?.name || 'Empresa').toUpperCase()} - CNPJ: ${cnpjBR(company?.cnpj)}`,
    74,
    yAss + 8,
  );

  doc.setFontSize(5);
  doc.setTextColor(110);
  doc.text(
    'Documento gerado pelo Custo Real RH IA. Cálculo conforme tabelas oficiais (INSS, IRRF, FGTS, INSS patronal).',
    8,
    yAss + 14,
  );

  doc.save(`holerite-${String(employee.full_name || 'colaborador').replace(/\s+/g, '_')}-${month}.pdf`);
}