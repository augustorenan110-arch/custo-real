import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2, Wallet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { Button } from '@/components/ui/button';
import ContadorStats from '@/components/contador/ContadorStats';
import ComissaoSlider from '@/components/contador/ComissaoSlider';
import EmpresasTable from '@/components/contador/EmpresasTable';
import CompanyForm from '@/components/contador/CompanyForm';
import { gerarReferralCode, linkIndicacao, PLANO_CLIENTE } from '@/lib/contador';
import { brl } from '@/lib/format';

export default function PainelContador() {
  const { data: me, isLoading: loadingMe } = useMe();
  const [formAberto, setFormAberto] = useState(false);

  const { data: assinaturas = [], isLoading, refetch } = useQuery({
    queryKey: ['contador-assinaturas', me?.id],
    queryFn: async () => {
      const res = await base44.entities.Subscription.filter({});
      return res?.items || res || [];
    },
    enabled: !!me?.id,
  });

  const resumo = useMemo(() => {
    const mesAtual = new Date().toISOString().slice(0, 7);
    return {
      total: assinaturas.length,
      ativas: assinaturas.filter((s) => s.status === 'active').length,
      acumulada: assinaturas.reduce((a, s) => a + Number(s.commission_to_accountant || 0), 0),
      mes: assinaturas
        .filter((s) => String(s.created_date || '').slice(0, 7) === mesAtual)
        .reduce((a, s) => a + Number(s.commission_to_accountant || 0), 0),
    };
  }, [assinaturas]);

  const referralCode = me?.referral_code || gerarReferralCode(me?.id);

  if (loadingMe || isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="font-display text-sm font-bold tracking-tight">
            CUSTO <span className="text-primary">REAL</span>
          </Link>
          <Link to="/contador" className="text-xs text-muted-foreground transition hover:text-foreground">
            Página do contador
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-6 sm:px-8 sm:py-10">
        <div className="glass rounded-2xl p-4 text-xs text-foreground/80 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span>
              Suas empresas: <strong className="text-foreground">{resumo.total}</strong>
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>
              Comissão mês: <strong className="text-save-tech">{brl(resumo.mes)}</strong>
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>
              Seu link: <strong className="text-primary">{linkIndicacao(referralCode)}</strong>
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setFormAberto(true)}
          className="glow h-12 w-full bg-[#007bff] text-base font-semibold text-white hover:bg-[#0064d2]"
        >
          <Plus className="mr-2 h-5 w-5" /> Cadastrar nova empresa cliente
        </Button>

        <ContadorStats
          total={resumo.total}
          ativas={resumo.ativas}
          acumulada={resumo.acumulada}
          mes={resumo.mes}
        />

        <ComissaoSlider />

        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold">Empresas cadastradas</h2>
          <EmpresasTable assinaturas={assinaturas} />
        </section>

        <div className="glass flex flex-col gap-2 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Sacar comissão</p>
              <p className="text-[11px] text-muted-foreground">
                Em breve - mínimo R$ 100 · saldo atual {brl(resumo.acumulada)}
              </p>
            </div>
          </div>
          <Button type="button" disabled className="h-11 w-full sm:w-auto">
            Sacar comissão
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Cada cliente ativo paga {brl(PLANO_CLIENTE.valor)}/mês e você recebe {brl(PLANO_CLIENTE.comissao)}/mês
          (30%) enquanto ele usar.
        </p>
      </main>

      <CompanyForm
        open={formAberto}
        onOpenChange={setFormAberto}
        referralCode={referralCode}
        onSaved={refetch}
      />
    </div>
  );
}