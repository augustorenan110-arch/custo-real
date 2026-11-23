import { Clock, CalendarClock, Briefcase } from 'lucide-react';
import { useMeuFuncionario } from '@/hooks/useMeuFuncionario';
import { useTimeEntries, useCompany } from '@/hooks/useHr';
import PontoFacial from '@/components/funcionario/PontoFacial';

const hoje = () => new Date().toISOString().slice(0, 10);
const mesAtual = () => new Date().toISOString().slice(0, 7);
const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR').slice(0, 5);

const KIND_LABEL = {
  entrada: 'Entrada',
  intervalo_inicio: 'Início do intervalo',
  intervalo_fim: 'Fim do intervalo',
  saida: 'Saída',
};
const ORDEM = ['entrada', 'intervalo_inicio', 'intervalo_fim', 'saida'];

const proximoKind = (batidas) => {
  if (!batidas.length) return 'entrada';
  const ultimo = batidas[batidas.length - 1];
  const idx = ORDEM.indexOf(ultimo.kind);
  if (idx === -1) return 'entrada';
  return ORDEM[(idx + 1) % ORDEM.length];
};

export default function MeuInicio() {
  const { me, funcionario } = useMeuFuncionario();
  const { data: company } = useCompany();
  const { data: entries = [] } = useTimeEntries(funcionario?.id, mesAtual());

  const primeiroNome = (funcionario?.full_name || me?.full_name || '').split(' ')[0] || 'colaborador';
  const batidasHoje = entries.filter((e) => e.day === hoje());
  const proximo = proximoKind(batidasHoje);
  const jornada = Number(company?.workday_hours) || 8;

  // Histórico do mês agrupado por dia (mais recente primeiro).
  const porDia = entries.reduce((acc, e) => {
    (acc[e.day] = acc[e.day] || []).push(e);
    return acc;
  }, {});
  const dias = Object.keys(porDia).sort().reverse();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Olá,</p>
        <h1 className="text-2xl font-semibold">{primeiroNome}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {batidasHoje.length
            ? batidasHoje.map((b) => `${KIND_LABEL[b.kind]} ${hora(b.punched_at)}`).join(' · ')
            : 'Nenhuma batida hoje'}
        </p>
      </div>

      {/* Jornada prevista */}
      <div className="glass flex items-center gap-3 rounded-2xl p-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Jornada prevista</p>
          <p className="text-sm font-medium">{jornada}h por dia</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Cargo</p>
          <p className="text-sm font-medium">{funcionario?.role_title || '—'}</p>
        </div>
      </div>

      {funcionario && <PontoFacial funcionario={funcionario} me={me} defaultKind={proximo} />}

      {/* Histórico do mês */}
      <div className="glass rounded-2xl p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <CalendarClock className="h-4 w-4 text-primary" /> Meu histórico
        </p>
        {dias.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">Sem registros neste mês.</p>
        )}
        <div className="mt-3 space-y-3">
          {dias.slice(0, 14).map((d) => (
            <div key={d}>
              <p className="text-xs font-semibold text-foreground/80">
                {new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {porDia[d].map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px]"
                  >
                    <span className="text-muted-foreground">{KIND_LABEL[b.kind]}</span>
                    <span className="font-medium">{hora(b.punched_at)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}