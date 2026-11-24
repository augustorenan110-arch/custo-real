import { jsPDF } from 'jspdf';
import logoCr from '@/assets/logo-cr.png';
import { dateBR, cnpjBR, cpfBR } from '@/lib/format';
import { calculateCustoReal } from '@/lib/payroll';

/* Holerite em UMA página A4 retrato (210 x 297 mm).
   Container único: margens 15 mm → largura útil 180 mm.
   Todos os blocos (Recibo, Tabela, Totais, Bases, Custo Real, Assinaturas)
   usam exatamente essa mesma largura, alinhados borda a borda. */
const HORAS_MES = 220;
const X = 15;            // margem esquerda do container
const W = 180;           // largura útil do container (210 - 15 - 15)
const R = X + W;         // borda direita = 195
const PG_H = 297;        // altura A4

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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `Holerite ${employee.full_name} ${month}`, subject: 'Recibo de pagamento e custo real', creator: 'Custo Real RH IA' });

  const nome = String(employee.full_name || 'Colaborador').toUpperCase();
  const salario = Number(employee.salary) || 0;
  const valorHora = salario / HORAS_MES;
  const logo = await carregarLogo().catch(() => null);
  const local = company?.cidade_uf || 'Matriz';
  const dataFolha = ultimoDia(month);

  // ── Cabeçalho (largura W) ──────────────────────────────────────────────────
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${company?.cnpj || '—'}`, X, 8);

  doc.setDrawColor(150);
  doc.rect(X, 10, 18, 18);
  if (logo) doc.addImage(logo, 'PNG', X + 1, 11, 16, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(String(company?.name || 'Empresa').toUpperCase(), X + 22, 14);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(String(company?.activity || '').slice(0, 80), X + 22, 18);
  doc.text(`CNPJ: ${cnpjBR(company?.cnpj)}`, X + 22, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Recibo de Pagto. de Salário', R, 14, { align: 'right' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folha Mensal ${dataFolha}`, R, 18, { align: 'right' });

  // ── Dados do funcionário (largura W) ───────────────────────────────────────
  doc.rect(X, 24, W, 11);
  doc.setFontSize(7);
  doc.text(`0002 ${nome}`, X + 2, 28);
  doc.text(`CPF: ${cpfBR(employee.cpf)}    Admissão: ${employee.admission_date ? dateBR(employee.admission_date) : '—'}`, X + 2, 32);
  doc.text(`Local: ${local}   Cargo: ${employee.role_title || '—'}`, X + 2, 34.5);

  // ── Tabela de vencimentos e descontos (grid fixo 6 colunas, largura W) ─────
  // Grid: Data 10% | Código 12% | Descrição 38% | Quant/Ref 12% | Base 14% | Valor 14%
  const G = {
    data: X + 2,
    cod: X + W * 0.10,
    desc: X + W * 0.22,
    quantRef: X + W * 0.60,
    baseRight: X + W * 0.86,
    valorRight: R - 2,
  };
  const topo = 38;
  doc.setFillColor(180, 180, 180);
  doc.rect(X, topo, W, 5, 'F');
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Data', G.data, topo + 3.5);
  doc.text('Código', G.cod, topo + 3.5);
  doc.text('Descrição', G.desc, topo + 3.5);
  doc.text('Quant/Ref', G.quantRef, topo + 3.5);
  doc.text('Base', G.baseRight, topo + 3.5, { align: 'right' });
  doc.text('Vencim.', G.valorRight - W * 0.07, topo + 3.5, { align: 'right' });
  doc.text('Desc.', G.valorRight, topo + 3.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  const linhas = lancamentos(slip, valorHora);
  const altura = Math.min(4.2, 30 / Math.max(linhas.length, 1));
  let y = topo + 6;
  let totalVenc = 0;
  let totalDesc = 0;

  linhas.forEach((l) => {
    if (l.desconto) totalDesc += l.valor;
    else totalVenc += l.valor;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('30', G.data, y);
    doc.text(l.cod, G.cod, y);
    doc.text(l.desc, G.desc, y);
    doc.text(`${l.quant} ${l.ref}`, G.quantRef, y);
    // Valores R$ em monospace (courier), alinhados à direita
    doc.setFont('courier', 'normal');
    if (l.base) doc.text(real(l.base), G.baseRight, y, { align: 'right' });
    doc.text(l.desconto ? '' : real(l.valor), G.valorRight - W * 0.07, y, { align: 'right' });
    doc.text(l.desconto ? real(l.valor) : '', G.valorRight, y, { align: 'right' });
    y += altura;
  });

  // ── Totais (mesma grade) ───────────────────────────────────────────────────
  const tot = y + 1;
  doc.rect(X, tot, W, 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Total de Vencimentos', G.data, tot + 3.5);
  doc.setFont('courier', 'bold');
  doc.text(real(totalVenc), G.valorRight - W * 0.07, tot + 3.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Total de Descontos', G.quantRef, tot + 3.5);
  doc.setFont('courier', 'bold');
  doc.text(real(totalDesc), G.valorRight, tot + 3.5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Valor Líquido =>', G.data, tot + 7.5);
  doc.setFont('courier', 'bold');
  doc.text(real(totalVenc - totalDesc), G.valorRight, tot + 7.5, { align: 'right' });

  // ── Bases de cálculo (6 colunas iguais, valores centralizados) ─────────────
  const inss = slip.deductions.find((d) => d.label === 'INSS')?.value || 0;
  const rodape = tot + 11;
  doc.setFillColor(180, 180, 180);
  doc.rect(X, rodape, W, 5, 'F');
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  const colW = W / 6;
  const rotulos = ['Salário Base', 'Sal. Contr. INSS', 'Base FGTS', 'FGTS do Mês', 'Base IRRF', 'Via do Empregado'];
  rotulos.forEach((rotulo, i) => doc.text(rotulo, X + i * colW + colW / 2, rodape + 3.5, { align: 'center' }));
  doc.rect(X, rodape + 5, W, 5);
  doc.setFont('courier', 'normal');
  const valores = [
    real(salario),
    real(slip.base),
    real(slip.base),
    real(slip.fgts),
    real(Math.max(0, slip.base - inss)),
    real(slip.net),
  ];
  valores.forEach((valor, i) => doc.text(valor, X + i * colW + colW / 2, rodape + 8.5, { align: 'center' }));

  // ── Custo Real (largura W — alinhado borda a borda com a tabela) ────────────
  const custoReal = calculateCustoReal(salario);
  const custoTotal = custoReal.total;
  const alemSalarioBase = round(custoTotal - salario);
  const yCusto = rodape + 13;

  // Barra de título azul (mesma largura W)
  doc.setFillColor(59, 130, 246);
  doc.rect(X, yCusto, W, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CUSTO REAL PARA A EMPRESA - DIFERENCIAL GR', X + 3, yCusto + 5);

  // Linha informativa do líquido
  doc.setTextColor(90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Salário Líquido pago ao funcionário: ${real(slip.net)}`, X + 3, yCusto + 11);

  // Quadro de custos (mesma largura W, alinhado)
  const qTop = yCusto + 13;
  const qH = 22;
  doc.setFillColor(238, 244, 255);
  doc.rect(X, qTop, W, qH, 'F');
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.3);
  doc.rect(X, qTop, W, qH, 'S');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  // 2 colunas: Descrição 70% (esquerda) | Valor 30% (direita, monospace)
  const valRight = R - 4;
  const linhasCusto = [
    ['Salário Base:', real(custoReal.salarioBase)],
    ['+ INSS Patronal:', real(custoReal.inssPatronal)],
    ['+ FGTS:', real(custoReal.fgts)],
    ['+ Provisão Férias + 1/3 + 13º:', real(custoReal.provisoes)],
  ];
  let yc = qTop + 5;
  for (const [rotulo, valor] of linhasCusto) {
    doc.setFont('helvetica', 'normal');
    doc.text(rotulo, X + 4, yc);
    doc.setFont('courier', 'normal');
    doc.text(valor, valRight, yc, { align: 'right' });
    yc += 4;
  }
  doc.setDrawColor(59, 130, 246);
  doc.line(X + 4, yc - 1, R - 4, yc - 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('= CUSTO TOTAL REAL:', X + 4, yc + 2.5);
  doc.setFont('courier', 'bold');
  doc.text(real(custoTotal), valRight, yc + 2.5, { align: 'right' });

  // Destaque "além do salário base" (mesma largura W)
  const yDest = qTop + qH + 2;
  doc.setFillColor(59, 130, 246);
  doc.rect(X, yDest, W, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`Você paga ${real(alemSalarioBase)} além do salário base de ${real(salario)}`, X + 3, yDest + 5);

  // ── Declaração ─────────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const yDecl = yDest + 12;
  doc.text('Declaro ter recebido a importância líquida discriminada neste recibo.', X, yDecl);

  // ── Assinaturas (largura W) ────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  const yAss = yDecl + 10;
  const halfW = W / 2;
  // Funcionário
  doc.setDrawColor(120);
  doc.line(X, yAss, X + halfW - 8, yAss);
  doc.text('Assinatura do funcionário', X, yAss + 4);
  doc.text(`${nome} - CPF: ${cpfBR(employee.cpf)}`, X, yAss + 8);
  // Empregador
  const xEmp = X + halfW + 8;
  doc.line(xEmp, yAss, R, yAss);
  doc.text('Assinatura do empregador', xEmp, yAss + 4);
  doc.text(`${String(company?.name || 'Empresa').toUpperCase()} - CNPJ: ${cnpjBR(company?.cnpj)}`, xEmp, yAss + 8);

  // ── Rodapé ─────────────────────────────────────────────────────────────────
  doc.setFontSize(5);
  doc.setTextColor(110);
  doc.text(
    'Documento gerado pelo Custo Real RH IA. Cálculo conforme tabelas oficiais (INSS, IRRF, FGTS, INSS patronal).',
    X,
    yAss + 14,
  );

  doc.save(`holerite-${String(employee.full_name || 'colaborador').replace(/\s+/g, '_')}-${month}.pdf`);
}