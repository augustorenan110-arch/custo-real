import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMeuFuncionario } from '@/hooks/useMeuFuncionario';
import { useCompany } from '@/hooks/useHr';
import { buildPayslip, resumoFaltas } from '@/lib/payroll';
import { buildTimesheet } from '@/lib/timesheet';
import { holeritePdf } from '@/lib/holerite';
import HoleriteRow from '@/components/funcionario/HoleriteRow';

const mesDe = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Últimos 12 meses (ou desde a admissão, se for mais recente), do mais novo ao mais antigo. */
function mesesDisponiveis(admissao) {
  const hoje = new Date();
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const adm = admissao ? new Date(`${admissao}T12:00:00`) : null;
  const inicio =
    adm && adm < fim && (fim - adm) / 2592000000 < 12
      ? new Date(adm.getFullYear(), adm.getMonth(), 1)
      : new Date(fim.getFullYear(), fim.getMonth() - 11, 1);

  const lista = [];
  for (let d = new Date(fim); d >= inicio; d = new Date(d.getFullYear(), d.getMonth() - 1, 1)) {
    lista.push(mesDe(d));
  }
  return lista;
}

const descontoVt = (funcionario) => {
  const salario = Number(funcionario?.salary) || 0;
  if (!funcionario?.vt_ativo) return 0;
  const teto = Number(funcionario?.vt_custo_total) || salario * 0.06;
  return Math.min(salario * 0.06, teto);
};

export default function MeuHolerite() {
  const { funcionario } = useMeuFuncionario();
  const { data: company } = useCompany();
  const [baixando, setBaixando] = useState('');

  const meses = useMemo(() => mesesDisponiveis(funcionario?.admission_date), [funcionario?.admission_date]);
  const inicio = `${meses[meses.length - 1]}-01`;

  const { data: pontos = [], isLoading: carregandoPontos } = useQuery({
    queryKey: ['meus-pontos', funcionario?.id, inicio],
    enabled: !!funcionario?.id,
    queryFn: async () => {
      const res = await base44.entities.TimeEntry.filter(
        { employee_id: funcionario.id, day: { $gte: inicio } },
        { sort: 'punched_at', limit: 500 },
      );
      return res?.items || res || [];
    },
  });

  const { data: faltas = [], isLoading: carregandoFaltas } = useQuery({
    queryKey: ['minhas-faltas', funcionario?.id, inicio],
    enabled: !!funcionario?.id,
    queryFn: async () => {
      const res = await base44.entities.Falta.filter(
        { employee_id: funcionario.id, mes_referencia: { $gte: inicio.slice(0, 7) } },
        { sort: '-data', limit: 200 },
      );
      return res?.items || res || [];
    },
  });

  const salario = Number(funcionario?.salary) || 0;
  const descontos = funcionario ? descontoVt(funcionario) : 0;

  const linhas = meses.map((mes) => {
    const doMes = pontos.filter((p) => (p.day || '').startsWith(mes));
    const sheet = buildTimesheet(doMes, mes, company?.workday_hours || 8);
    const faltasMes = faltas.filter((f) => (f.mes_referencia || (f.data || '').slice(0, 7)) === mes);
    const slip = buildPayslip({
      gross: salario,
      extraHours: sheet.extra / 60,
      transportDiscount: descontos,
      faltaDiscount: resumoFaltas(faltasMes, salario).desconto,
    });
    return { mes, slip, extras: sheet.extra / 60, faltas: faltasMes.length };
  });

  const baixar = async (linha) => {
    setBaixando(linha.mes);
    try {
      await holeritePdf({ company, employee: funcionario, month: linha.mes, slip: linha.slip });
    } catch (e) {
      console.error('Não foi possível gerar o holerite', e);
    } finally {
      setBaixando('');
    }
  };

  if (carregandoPontos || carregandoFaltas) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <FileText className="h-6 w-6 text-primary" /> Meus holerites
        </h1>
        <p className="text-sm text-muted-foreground">
          Recibos do seu mês, calculados com o seu salário, pontos e faltas.
        </p>
      </div>

      <div className="grid gap-3">
        {linhas.map((l) => (
          <HoleriteRow
            key={l.mes}
            mes={l.mes}
            slip={l.slip}
            extras={l.extras}
            faltas={l.faltas}
            baixando={baixando === l.mes}
            onBaixar={() => baixar(l)}
          />
        ))}
      </div>
    </div>
  );
}