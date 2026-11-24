import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logoCr from '@/assets/logo-cr.png';
import { dateBR, cnpjBR, cpfBR } from '@/lib/format';
import { calculateCustoReal } from '@/lib/payroll';

const HORAS_MES = 220;

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
      ? { cod: '0002', desc: 'Hora Extra 50%', quant: dinheiro(e.value / (valorHora * 1.5)), ref: 'HORAS', base: valorHora * 1.5, valor: e.value, desconto: false }
      : { cod: '0001', desc: 'Horas Normais', quant: `${HORAS_MES},00`, ref: 'HORAS', base: valorHora, valor: e.value, desconto: false },
  );

  const temExtra = slip.earnings.some((e) => String(e.label).startsWith('Horas extras'));
  if (!temExtra) {
    vencimentos.push({ cod: '0002', desc: 'Hora Extra 50%', quant: '0,00', ref: 'HORAS', base: valorHora * 1.5, valor: 0, desconto: false });
  }
  vencimentos.push({ cod: '0003', desc: 'Adicional Noturno', quant: '0,00', ref: 'HORAS', base: valorHora, valor: 0, desconto: false });

  const descontos = slip.deductions.map((d) => {
    if (d.label === 'INSS') return { cod: '0998', desc: 'INSS', quant: proporcao(d.value, slip.base), ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    if (d.label === 'IRRF') return { cod: '0561', desc: 'IRRF', quant: proporcao(d.value, slip.base), ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    if (String(d.label).startsWith('Vale-transporte')) return { cod: '0930', desc: 'Vale Transporte', quant: '6,00', ref: 'VALOR', base: slip.base, valor: d.value, desconto: true };
    return { cod: '0100', desc: 'Faltas N/ Justif.', quant: '', ref: 'DIAS', base: 0, valor: d.value, desconto: true };
  });

  const temVt = slip.deductions.some((d) => String(d.label).startsWith('Vale-transporte'));
  if (!temVt) {
    descontos.push({ cod: '0930', desc: 'Vale Transporte', quant: '0,00', ref: 'VALOR', base: slip.base, valor: 0, desconto: true });
  }

  return [...vencimentos, ...descontos];
}

function buildHtml({ company, employee, month, slip, logo, linhas, totalVenc, totalDesc, custoReal, alemSalarioBase }) {
  const nome = String(employee.full_name || 'Colaborador').toUpperCase();
  const salario = Number(employee.salary) || 0;
  const inss = slip.deductions.find((d) => d.label === 'INSS')?.value || 0;
  const local = company?.cidade_uf || 'Matriz';
  const dataFolha = ultimoDia(month);

  const td = 'padding:4px 6px;font-size:11px;overflow:hidden;white-space:nowrap;vertical-align:middle;';
  const tdR = `${td}text-align:right;font-variant-numeric:tabular-nums;font-family:monospace;`;
  const th = 'padding:4px 6px;font-size:11px;font-weight:bold;overflow:hidden;white-space:nowrap;';

  const rows = linhas.map((l) => `
    <tr>
      <td style="${td}">30</td>
      <td style="${td}">${l.cod}</td>
      <td style="${td}">${l.desc}</td>
      <td style="${td}">${l.quant} ${l.ref}</td>
      <td style="${tdR}">${l.base ? real(l.base) : ''}</td>
      <td style="${tdR}">${l.desconto ? '' : real(l.valor)}</td>
      <td style="${tdR}">${l.desconto ? real(l.valor) : ''}</td>
    </tr>`).join('');

  return `
  <div style="width:794px;padding:40px;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#000;box-sizing:border-box;">
    <!-- Cabeçalho -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
      <div style="display:flex;gap:10px;align-items:center;">
        ${logo ? `<img src="${logo}" style="width:48px;height:48px;border:1px solid #999;object-fit:contain;" />` : `<div style="width:48px;height:48px;border:1px solid #999;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">CR</div>`}
        <div>
          <div style="font-size:12px;font-weight:bold;">${String(company?.name || 'Empresa').toUpperCase()}</div>
          <div style="font-size:9px;">${String(company?.activity || '').slice(0, 80)}</div>
          <div style="font-size:9px;">CNPJ: ${cnpjBR(company?.cnpj)}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;font-weight:bold;">Recibo de Pagto. de Salário</div>
        <div style="font-size:9px;">Folha Mensal ${dataFolha}</div>
      </div>
    </div>

    <!-- Dados do funcionário -->
    <div style="border:1px solid #999;padding:6px 8px;margin-bottom:6px;font-size:10px;">
      <div style="font-weight:bold;">0002 ${nome}</div>
      <div>CPF: ${cpfBR(employee.cpf)} &nbsp;&nbsp; Admissão: ${employee.admission_date ? dateBR(employee.admission_date) : '—'}</div>
      <div>Local: ${local} &nbsp;&nbsp; Cargo: ${employee.role_title || '—'}</div>
    </div>

    <!-- Tabela de Vencimentos e Descontos -->
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #999;">
      <thead>
        <tr style="background:#b4b4b4;">
          <th style="${th}width:8%;text-align:left;">Data</th>
          <th style="${th}width:10%;text-align:left;">Código</th>
          <th style="${th}width:30%;text-align:left;">Descrição</th>
          <th style="${th}width:14%;text-align:left;">Quant/Ref</th>
          <th style="${th}width:13%;text-align:right;">Base</th>
          <th style="${th}width:12.5%;text-align:right;">Vencim.</th>
          <th style="${th}width:12.5%;text-align:right;">Desc.</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="border-top:1px solid #999;font-weight:bold;background:#f0f0f0;">
          <td style="${td}" colspan="4">Total de Vencimentos</td>
          <td style="${td}"></td>
          <td style="${tdR}font-weight:bold;">${real(totalVenc)}</td>
          <td style="${tdR}font-weight:bold;">${real(totalDesc)}</td>
        </tr>
        <tr style="font-weight:bold;border-top:1px solid #ccc;font-size:13px;">
          <td style="${td}" colspan="5">Valor Líquido =></td>
          <td style="${td}"></td>
          <td style="${tdR}font-weight:bold;font-size:13px;">${real(totalVenc - totalDesc)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Bases de Cálculo -->
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:6px;border:1px solid #999;">
      <thead>
        <tr style="background:#b4b4b4;">
          <th style="${th}width:16.67%;text-align:center;font-size:9px;">Salário Base</th>
          <th style="${th}width:16.67%;text-align:center;font-size:9px;">Sal. Contr. INSS</th>
          <th style="${th}width:16.67%;text-align:center;font-size:9px;">Base FGTS</th>
          <th style="${th}width:16.67%;text-align:center;font-size:9px;">FGTS do Mês</th>
          <th style="${th}width:16.67%;text-align:center;font-size:9px;">Base IRRF</th>
          <th style="${th}width:16.67%;text-align:center;font-size:9px;">Via do Empregado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="${tdR}text-align:center;">${real(salario)}</td>
          <td style="${tdR}text-align:center;">${real(slip.base)}</td>
          <td style="${tdR}text-align:center;">${real(slip.base)}</td>
          <td style="${tdR}text-align:center;">${real(slip.fgts)}</td>
          <td style="${tdR}text-align:center;">${real(Math.max(0, slip.base - inss))}</td>
          <td style="${tdR}text-align:center;">${real(slip.net)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Custo Real -->
    <div style="background:#3b82f6;color:#fff;padding:6px 10px;font-weight:bold;font-size:12px;margin-top:10px;">
      CUSTO REAL PARA A EMPRESA - DIFERENCIAL GR
    </div>
    <div style="background:#eef4ff;border:1px solid #3b82f6;border-top:none;padding:8px 10px;">
      <div style="font-size:10px;color:#555;margin-bottom:6px;">Salário Líquido pago ao funcionário: ${real(slip.net)}</div>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <tr>
          <td style="width:70%;padding:3px 6px;font-size:11px;">Salário Base:</td>
          <td style="width:30%;padding:3px 6px;text-align:right;font-size:11px;font-variant-numeric:tabular-nums;font-family:monospace;">${real(custoReal.salarioBase)}</td>
        </tr>
        <tr>
          <td style="width:70%;padding:3px 6px;font-size:11px;">+ INSS Patronal:</td>
          <td style="width:30%;padding:3px 6px;text-align:right;font-size:11px;font-variant-numeric:tabular-nums;font-family:monospace;">${real(custoReal.inssPatronal)}</td>
        </tr>
        <tr>
          <td style="width:70%;padding:3px 6px;font-size:11px;">+ FGTS:</td>
          <td style="width:30%;padding:3px 6px;text-align:right;font-size:11px;font-variant-numeric:tabular-nums;font-family:monospace;">${real(custoReal.fgts)}</td>
        </tr>
        <tr>
          <td style="width:70%;padding:3px 6px;font-size:11px;">+ Provisão Férias + 1/3 + 13º:</td>
          <td style="width:30%;padding:3px 6px;text-align:right;font-size:11px;font-variant-numeric:tabular-nums;font-family:monospace;">${real(custoReal.provisoes)}</td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:4px;border-top:1px solid #3b82f6;">
        <tr style="background:#1e40af;color:#fff;">
          <td style="width:70%;padding:5px 6px;font-weight:bold;font-size:12px;">= CUSTO TOTAL REAL:</td>
          <td style="width:30%;padding:5px 6px;text-align:right;font-weight:bold;font-size:13px;font-variant-numeric:tabular-nums;font-family:monospace;">${real(custoReal.total)}</td>
        </tr>
      </table>
    </div>
    <div style="background:#3b82f6;color:#fff;padding:5px 10px;font-weight:bold;font-size:11px;">
      Você paga ${real(alemSalarioBase)} além do salário base de ${real(salario)}
    </div>

    <!-- Declaração -->
    <div style="font-size:11px;margin-top:12px;">Declaro ter recebido a importância líquida discriminada neste recibo.</div>

    <!-- Assinaturas -->
    <div style="display:flex;justify-content:space-between;margin-top:28px;font-size:9px;">
      <div style="width:45%;">
        <div style="border-top:1px solid #777;padding-top:3px;">Assinatura do funcionário</div>
        <div style="margin-top:2px;">${nome} - CPF: ${cpfBR(employee.cpf)}</div>
      </div>
      <div style="width:45%;">
        <div style="border-top:1px solid #777;padding-top:3px;">Assinatura do empregador</div>
        <div style="margin-top:2px;">${String(company?.name || 'Empresa').toUpperCase()} - CNPJ: ${cnpjBR(company?.cnpj)}</div>
      </div>
    </div>

    <!-- Rodapé -->
    <div style="font-size:8px;color:#777;margin-top:10px;">Documento gerado pelo Custo Real RH IA. Cálculo conforme tabelas oficiais (INSS, IRRF, FGTS, INSS patronal).</div>
  </div>`;
}

export async function holeritePdf({ company, employee, month, slip }) {
  const salario = Number(employee.salary) || 0;
  const valorHora = salario / HORAS_MES;
  const logo = await carregarLogo().catch(() => null);

  const linhas = lancamentos(slip, valorHora);
  const totalVenc = linhas.filter((l) => !l.desconto).reduce((s, l) => s + l.valor, 0);
  const totalDesc = linhas.filter((l) => l.desconto).reduce((s, l) => s + l.valor, 0);

  const custoReal = calculateCustoReal(salario);
  const alemSalarioBase = round(custoReal.total - salario);

  const html = buildHtml({ company, employee, month, slip, logo, linhas, totalVenc, totalDesc, custoReal, alemSalarioBase });

  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-99999px;top:0;background:#fff;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`holerite-${String(employee.full_name || 'colaborador').replace(/\s+/g, '_')}-${month}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}