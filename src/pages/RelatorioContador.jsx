import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, FileText, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCompany, useEmployees } from '@/hooks/useHr';
import { brl } from '@/lib/format';
import { calcularTotaisEmpresa } from '@/lib/payroll';
import { buildTimesheet } from '@/lib/timesheet';
import { buildRelatorioContador, mesReferencia, nomeArquivoRelatorio } from '@/lib/relatorioContador';
import RelatorioForm from '@/components/contador/RelatorioForm';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function RelatorioContador() {
  const navigate = useNavigate();
  const { data: empresa } = useCompany();
  const { data: funcionarios = [] } = useEmployees();
  const [month, setMonth] = useState(thisMonth());
  const [incluir, setIncluir] = useState({ passivo: true, ranking: true, ponto: true });
  const [gerando, setGerando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const { data: registros = [] } = useQuery({
    queryKey: ['relatorio-ponto', month],
    enabled: !!funcionarios.length,
    queryFn: async () => {
      const page = await base44.entities.TimeEntry.filter(
        { day: { $gte: `${month}-01`, $lte: `${month}-31` } },
        { sort: 'punched_at', limit: 500 },
      );
      return page?.items || page || [];
    },
  });

  const ponto = useMemo(() => {
    const mapa = {};
    for (const f of funcionarios) {
      const sheet = buildTimesheet(
        registros.filter((e) => e.employee_id === f.id),
        month,
        empresa?.workday_hours || 8,
      );
      mapa[f.id] = {
        nome: f.full_name,
        worked: sheet.worked,
        late: sheet.late,
        extra: sheet.extra,
        dias: sheet.rows.length,
      };
    }
    return mapa;
  }, [funcionarios, registros, month, empresa?.workday_hours]);

  const totais = useMemo(() => calcularTotaisEmpresa(funcionarios), [funcionarios]);

  const toggle = (key) => setIncluir((v) => ({ ...v, [key]: !v[key] }));

  const gerar = () => {
    setGerando(true);
    try {
      const doc = buildRelatorioContador({
        empresa,
        funcionarios,
        month,
        incluir,
        ponto,
        emitidoEm: new Date(),
      });
      doc.save(nomeArquivoRelatorio(empresa?.name, month));
      setPdfUrl(String(doc.output('bloburl')));
    } finally {
      setGerando(false);
    }
  };

  const mensagem = `Olá! Segue o relatório contábil de ${mesReferencia(month)} da ${
    empresa?.name || 'empresa'
  }: custo real da folha ${brl(totais.custoReal)} e passivo de demissão ${brl(totais.passivo)}.`;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[#94A3B8] transition hover:text-white"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <header>
        <h1 className="text-xl font-black text-white">Relatório para Contador</h1>
        <p className="text-sm text-[#94A3B8]">
          Gere um PDF com validade contábil para enviar ao seu escritório
        </p>
      </header>

      <RelatorioForm
        month={month}
        onMonth={setMonth}
        incluir={incluir}
        onToggle={toggle}
        onGenerate={gerar}
        gerando={gerando}
      />

      {!funcionarios.length && (
        <p className="rounded-xl border border-[#334155] bg-[#1E293B] p-4 text-sm text-[#94A3B8]">
          Cadastre um funcionário para gerar o relatório contábil.
        </p>
      )}

      {pdfUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText size={16} className="text-[#22C55E]" /> PDF gerado
          </div>

          <iframe
            title="Prévia do relatório contábil"
            src={pdfUrl}
            className="h-[420px] w-full rounded-xl border border-[#334155] bg-white"
          />

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#1E293B] text-sm font-medium text-white transition hover:border-[#22C55E]"
          >
            <ExternalLink size={16} /> Abrir PDF em nova aba
          </a>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] font-bold text-black transition hover:bg-[#16a34a]"
          >
            <MessageCircle size={18} /> Enviar para contador no WhatsApp
          </a>

          <button
            type="button"
            onClick={() => navigate('/p')}
            className="h-11 w-full rounded-xl border border-[#334155] bg-[#08080A] text-sm text-[#94A3B8] transition hover:text-white"
          >
            Voltar para o painel
          </button>
        </div>
      )}
    </div>
  );
}