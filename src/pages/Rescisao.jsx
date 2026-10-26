import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HandCoins, AlertTriangle, FileText, Loader2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMe } from '@/hooks/useMe';
import { useCompany } from '@/hooks/useHr';
import { hasPremium } from '@/lib/plan';
import { brl, todayISO } from '@/lib/format';
import { calcRescisao, TERMINATION_TYPES, suggestedFgts, monthsBetween } from '@/lib/rescisao';
import { buildTermoRescisao } from '@/lib/termoRescisao';
import { useToast } from '@/components/ui/use-toast';

export default function Rescisao() {
  const { data: me } = useMe();
  const { data: company } = useCompany();
  const [form, setForm] = useState({
    salario: 2000,
    admissao: mesesAtras(9),
    demissao: todayISO(),
    tipo: 'sem_justa_causa',
    avisoTrabalhado: false,
    fgts: '',
    vencidas: 0,
  });
  const [gerando, setGerando] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const { toast } = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salario = Number(form.salario) || 0;
  const meses = monthsBetween(form.admissao, form.demissao);
  const fgtsSugerido = suggestedFgts(salario, meses);
  const saldoFgts = form.fgts === '' ? fgtsSugerido : Number(form.fgts);
  const datasInvertidas = !!form.admissao && !!form.demissao && form.demissao < form.admissao;

  // Custo de demissão exibido em tempo real (mesma base do material de campanha).
  const card = useMemo(() => {
    const multa40 = saldoFgts * 0.4;
    const avisoPrevio = salario;
    const decimoTerceiro = (salario / 12) * meses;
    const ferias = (salario / 12) * meses;
    const umTercoFerias = ferias / 3;
    return {
      fgts: saldoFgts,
      multa40,
      avisoPrevio,
      decimoTerceiro,
      ferias,
      umTercoFerias,
      total: multa40 + avisoPrevio + decimoTerceiro + ferias + umTercoFerias + saldoFgts,
    };
  }, [salario, meses, saldoFgts]);

  const r = useMemo(
    () =>
      calcRescisao({
        salario_base: Number(form.salario),
        data_admissao: form.admissao,
        data_demissao: form.demissao,
        tipo_demissao: form.tipo,
        saldo_fgts_total: saldoFgts,
        tem_aviso_trabalhado: form.avisoTrabalhado,
        periodos_ferias_vencidas: Number(form.vencidas) || 0,
      }),
    [form, saldoFgts],
  );

  const gerarTermo = () => {
    setGerando(true);
    try {
      const doc = buildTermoRescisao({ empresa: company, form, r, card });
      setPdfUrl(URL.createObjectURL(doc.output('blob')));
      doc.save(`Termo-Rescisao-${form.demissao}.pdf`);
      toast({ title: 'PDF gerado!', description: 'Verifique seus downloads.' });
    } catch (e) {
      toast({
        title: 'Não foi possível gerar o PDF',
        description: String(e?.message || e),
        variant: 'destructive',
      });
    } finally {
      setGerando(false);
    }
  };

  if (company && !hasPremium(company)) {
    return (
      <div className="glass rounded-2xl p-6">
        <Lock className="h-6 w-6 text-primary" />
        <h1 className="mt-3 text-lg font-semibold">Simulador de rescisão é PREMIUM</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O cálculo de gastos com demissão, multa de 40% e ranking de custo real faz parte do plano PREMIUM.
        </p>
        <Button asChild className="mt-4">
          <Link to="/planos">Ver planos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <HandCoins className="h-6 w-6 text-primary" /> Simulador de rescisão
        </h1>
        <p className="text-sm text-muted-foreground">
          Quanto custa demitir hoje, segundo a CLT: saldo, aviso, 13º, férias, FGTS e multa de 40%.
        </p>
      </div>

      <div className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sal">Salário base (R$)</Label>
          <Input id="sal" type="number" step="0.01" value={form.salario} onChange={set('salario')} className="field" />
        </div>
        <div className="space-y-1.5">
          <Label>Motivo</Label>
          <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
            <SelectTrigger className="field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TERMINATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adm">Admissão</Label>
          <Input id="adm" type="date" value={form.admissao} onChange={set('admissao')} className="field" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dem">Demissão</Label>
          <Input id="dem" type="date" value={form.demissao} onChange={set('demissao')} className="field" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fgts">Saldo FGTS (R$)</Label>
          <Input
            id="fgts"
            type="number"
            step="0.01"
            value={form.fgts === '' ? fgtsSugerido : form.fgts}
            onChange={set('fgts')}
            className="field"
          />
          <p className="text-[11px] text-muted-foreground">
            Calculado automático: {meses} meses × salário × 8%. Edite para ajustar.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="venc">Períodos de férias vencidas</Label>
          <Input id="venc" type="number" min="0" value={form.vencidas} onChange={set('vencidas')} className="field" />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground/80 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.avisoTrabalhado}
            onChange={(e) => setForm((f) => ({ ...f, avisoTrabalhado: e.target.checked }))}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          Aviso prévio trabalhado (não paga aviso indenizado)
        </label>
      </div>

      {datasInvertidas && (
        <div className="glass flex items-center gap-2 rounded-2xl p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> A data da demissão precisa ser depois da admissão.
        </div>
      )}

      {!datasInvertidas && (
        <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-4">
          <p className="font-bold text-white">Total pra demitir: {brl(card.total)}</p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            FGTS {moeda(card.fgts)} + Multa 40% {moeda(card.multa40)} + Aviso {moeda(card.avisoPrevio)} + 13º{' '}
            {moeda(card.decimoTerceiro)} + Férias {moeda(card.ferias)} + 1/3 {moeda(card.umTercoFerias)}
          </p>
        </div>
      )}

      {r && (
        <>
          <div className="glass overflow-hidden rounded-2xl">
            <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span>Verba rescisória</span>
              <span>Valor</span>
            </div>
            {r.rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[1fr_auto] gap-2 border-b border-white/5 px-4 py-2.5 text-sm last:border-0">
                <span className="text-foreground/80">{label}</span>
                <span className="font-medium tabular-nums">{brl(value)}</span>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl border-destructive/40 p-5 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total para demitir hoje</p>
            <p className="mt-1 font-display text-4xl font-bold text-destructive">{brl(r.total)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {terminationSummary(r, form.tipo)}
            </p>
          </div>

          <button
            type="button"
            disabled={gerando}
            onClick={gerarTermo}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#007bff] font-bold text-white transition-all hover:bg-[#0064d2] disabled:opacity-60"
          >
            {gerando ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {gerando ? 'Gerando...' : 'Gerar termo de rescisão em PDF'}
          </button>

          {pdfUrl && (
            <iframe
              title="Prévia do termo de rescisão"
              src={pdfUrl}
              className="h-[420px] w-full rounded-xl border border-[#334155] bg-white"
            />
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Cálculo informativo conforme CLT (saldo de salário, aviso prévio proporcional, 13º e férias
            proporcionais, 1/3, FGTS do mês e multa de 40%). Confirme os valores com a sua contabilidade antes de
            qualquer pagamento.
          </p>
        </>
      )}
    </div>
  );
}

function terminationSummary(r, tipo) {
  const motivo = TERMINATION_TYPES.find((t) => t.value === tipo)?.label || '';
  return `${motivo} · ${r.meses_trabalhados} meses de casa · ${r.avos_13}/12 avos de 13º · ${r.avos_ferias}/12 avos de férias · FGTS ${brl(r.saldoFgts)}`;
}

const moeda = (v) => (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function mesesAtras(meses) {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d.toISOString().slice(0, 10);
}