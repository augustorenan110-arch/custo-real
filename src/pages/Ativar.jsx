import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Copy, CreditCard, Loader2, QrCode, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@/components/GoogleIcon';
import { useMe } from '@/hooks/useMe';
import { custoDemissao, CAMPANHA } from '@/lib/campanha';
import { PLANO_CLIENTE } from '@/lib/contador';
import { brl } from '@/lib/format';
import { toast } from '@/components/ui/use-toast';

const PIX_FIXO =
  '00020126580014BR.GOV.BCB.PIX0136custo-real-assinatura-cnpj5204000053039865802BR5913CUSTO REAL6013SAO PAULO62070503***6304A1B2';

export default function Ativar() {
  const { id } = useParams();
  const { data: me, isLoading: loadingMe } = useMe();
  const [empresa, setEmpresa] = useState(null);
  const [metodo, setMetodo] = useState('pix');
  const [ativado, setAtivado] = useState(null);
  const [processando, setProcessando] = useState(false);

  const passivo = custoDemissao(CAMPANHA.salario, CAMPANHA.meses);

  useEffect(() => {
    let ativo = true;
    base44.entities.Company.get(id)
      .then((c) => ativo && setEmpresa(c))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [id]);

  const entrarComGoogle = () => base44.auth.loginWithProvider('google', `/ativar/${id}`);

  const pagar = async () => {
    setProcessando(true);
    try {
      const resposta = await base44.functions.invoke('ativarEmpresa', { company_id: id, metodo });
      setAtivado(resposta.data);
      toast({ title: 'Assinatura ativa!', description: '7 dias de PREMIUM liberados para a empresa.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Não deu para ativar agora',
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setProcessando(false);
    }
  };

  const contadorNome = empresa?.accountant_name || 'seu contador';

  return (
    <div className="tech-shell min-h-screen">
      <div className="tech-grid mx-auto max-w-xl px-5 py-10 sm:px-8">
        <Link to="/" className="font-tech text-xs text-muted-foreground">
          custo-real.com
        </Link>

        <h1 className="mt-6 font-tech text-xl font-extrabold sm:text-2xl">
          Seu contador {contadorNome} calculou seu passivo
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {empresa ? `${empresa.name} · CNPJ ${empresa.cnpj}` : 'Empresa cadastrada pelo seu contador'}
        </p>

        <div className="tech-card mt-6 rounded-3xl p-6">
          <p className="text-xs text-foreground/70">Passivo trabalhista hoje (salário R$ 2.000 · 8 meses)</p>
          <p className="text-cost-tech font-tech text-3xl font-extrabold sm:text-4xl">{brl(passivo.total)}</p>

          <div className="mt-4 grid gap-x-6 gap-y-1.5 rounded-2xl border border-white/10 bg-black/25 p-3 sm:grid-cols-2">
            {passivo.rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-foreground/70">{label}</span>
                <span className="font-medium tabular-nums">{brl(value)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span>FGTS acumulado (já depositado)</span>
            <span className="tabular-nums">{brl(passivo.fgtsAcumulado)}</span>
          </p>
        </div>

        {ativado ? (
          <div className="tech-card mt-6 rounded-3xl p-6">
            <p className="flex items-center gap-2 font-tech text-lg font-bold text-save-tech">
              <Check className="h-5 w-5" /> Assinatura ativa!
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              {brl(ativado.amount)}/mês · 7 dias de teste · comissão do contador {brl(ativado.commission_to_accountant)}/mês.
            </p>
            <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-muted-foreground">
              [WhatsApp simulado] Pagamento confirmado via {metodo} · empresa {ativado.company_name}. Comissão de{' '}
              {brl(ativado.commission_to_accountant)} registrada para o contador.
            </p>
            <Link
              to="/p"
              className="cta-blue mt-4 block rounded-xl px-5 py-3 text-center text-sm font-semibold"
            >
              Entrar no app e ver meu passivo
            </Link>
          </div>
        ) : (
          <div className="tech-card mt-6 rounded-3xl p-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMetodo('pix')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  metodo === 'pix' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/12 text-muted-foreground'
                }`}
              >
                <QrCode className="h-4 w-4" /> Pix
              </button>
              <button
                type="button"
                onClick={() => setMetodo('cartao')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  metodo === 'cartao' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/12 text-muted-foreground'
                }`}
              >
                <CreditCard className="h-4 w-4" /> Cartão
              </button>
            </div>

            {metodo === 'pix' ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-[11px] text-muted-foreground">Pix copia e cola</p>
                <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-foreground/70">{PIX_FIXO}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(PIX_FIXO);
                    toast({ title: 'Código Pix copiado' });
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-primary"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar código
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Número do cartão"
                  className="field h-11 rounded-xl px-3 text-sm sm:col-span-2"
                  inputMode="numeric"
                />
                <input placeholder="Validade MM/AA" className="field h-11 rounded-xl px-3 text-sm" />
                <input placeholder="CVV" className="field h-11 rounded-xl px-3 text-sm" />
              </div>
            )}

            {!me ? (
              <button
                type="button"
                onClick={entrarComGoogle}
                className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#DADCE0] bg-white text-sm font-medium text-[#3C4043] transition hover:bg-[#F8F9FA]"
              >
                <GoogleIcon className="h-5 w-5" /> Continuar com Google para ativar
              </button>
            ) : (
              <Button
                type="button"
                onClick={pagar}
                disabled={processando || loadingMe}
                className="mt-5 h-12 w-full bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
              >
                {processando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ativando...
                  </>
                ) : (
                  `Ativar minha empresa por ${brl(PLANO_CLIENTE.valor)}/mês - 7 dias grátis`
                )}
              </Button>
            )}

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-save-tech" /> Checkout em modo de teste — nenhuma cobrança real.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}