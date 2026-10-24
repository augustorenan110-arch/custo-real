import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Percent, Repeat, BadgeCheck, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GoogleIcon from '@/components/GoogleIcon';
import StoreButtons from '@/components/StoreButtons';
import { toast } from '@/components/ui/use-toast';
import { maskCnpj, validaCnpj, maskPhone, gerarReferralCode } from '@/lib/contador';
import { useMe } from '@/hooks/useMe';

const DESTAQUES = [
  { icon: Building2, texto: 'Modelo por CNPJ' },
  { icon: Percent, texto: 'Seu cliente paga R$ 59,90/mês' },
  { icon: Repeat, texto: 'Você recebe R$ 17,97/mês' },
  { icon: BadgeCheck, texto: 'Sem custo fixo pra você' },
  { icon: BadgeCheck, texto: 'Relatório com sua logo' },
];

export default function Contador() {
  const navigate = useNavigate();
  const { data: me, refetch } = useMe();
  const [form, setForm] = useState({ nome: '', escritorio: '', whatsapp: '', cnpj: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const entrarComGoogle = () => base44.auth.loginWithProvider('google', '/contador');

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validaCnpj(form.cnpj)) {
      setErro('CNPJ do escritório inválido.');
      return;
    }
    setSalvando(true);
    try {
      await base44.auth.updateMe({
        is_accountant: true,
        office_name: form.escritorio,
        whatsapp: form.whatsapp,
        cnpj_escritorio: form.cnpj,
        referral_code: me?.referral_code || gerarReferralCode(me?.id),
        commission_balance: me?.commission_balance || 0,
      });
      await refetch();
      toast({ title: 'Cadastro de contador pronto', description: 'Agora cadastre sua primeira empresa cliente.' });
      navigate('/painel-contador');
    } catch (err) {
      setErro('Não foi possível salvar seu cadastro. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="tech-shell min-h-screen">
      <div className="tech-grid">
        <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link to="/" className="font-tech text-sm font-bold tracking-tight">
            CUSTO <span className="text-primary">REAL</span>
          </Link>
          <Link to="/painel-contador" className="text-xs text-muted-foreground transition hover:text-foreground">
            Já sou contador · meu painel
          </Link>
        </header>

        <main className="mx-auto max-w-3xl px-5 pb-4 pt-6 text-center sm:px-8">
          <motion.h1
            className="font-tech text-2xl font-extrabold leading-tight sm:text-4xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Cadastre cada cliente seu por R$ 59,90 e ganhe R$ 18/mês por cada um
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75">
            Sem pacote, sem mensalidade pra você. Você cadastra o CNPJ do cliente, ele paga direto, você ganha 30%
            recorrente enquanto ele usar. 80 clientes = R$ 1.438/mês extra.
          </p>

          <div className="tech-card mt-8 rounded-3xl p-6 text-left sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Modelo por CNPJ</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {DESTAQUES.map((d) => (
                <li key={d.texto} className="flex items-center gap-2.5 text-sm text-foreground/85">
                  <d.icon className="h-4 w-4 shrink-0 text-primary" /> {d.texto}
                </li>
              ))}
            </ul>
          </div>

          <div className="tech-card mt-6 rounded-3xl p-6 text-left sm:p-8">
            <h2 className="font-tech text-base font-bold">Criar meu cadastro de contador</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Nome, escritório, WhatsApp e CNPJ — depois é só cadastrar os clientes.
            </p>

            {!me ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={entrarComGoogle}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#DADCE0] bg-white text-sm font-medium text-[#3C4043] transition hover:bg-[#F8F9FA]"
                >
                  <GoogleIcon className="h-5 w-5" /> Continuar com Google
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Entre para criar seu cadastro de contador em 30 segundos.
                </p>
              </div>
            ) : (
              <form onSubmit={salvar} className="mt-5 space-y-4">
                {erro && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="c-nome">Seu nome</Label>
                  <Input
                    id="c-nome"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Ana Contadora"
                    className="field h-12"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-esc">Escritório</Label>
                  <Input
                    id="c-esc"
                    value={form.escritorio}
                    onChange={(e) => setForm({ ...form, escritorio: e.target.value })}
                    placeholder="Ex: Contabilidade Silva"
                    className="field h-12"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-zap">WhatsApp</Label>
                    <Input
                      id="c-zap"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })}
                      placeholder="(11) 99999-9999"
                      className="field h-12"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-cnpj">CNPJ do escritório</Label>
                    <Input
                      id="c-cnpj"
                      value={form.cnpj}
                      onChange={(e) => setForm({ ...form, cnpj: maskCnpj(e.target.value) })}
                      placeholder="00.000.000/0000-00"
                      className="field h-12"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="h-12 w-full font-semibold" disabled={salvando}>
                  {salvando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    'Criar cadastro e ver meu painel'
                  )}
                </Button>
              </form>
            )}
          </div>
        </main>

        <StoreButtons />
      </div>
    </div>
  );
}