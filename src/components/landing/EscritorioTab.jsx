import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useMe } from '@/hooks/useMe';
import { brl } from '@/lib/format';
import { maskCnpj, validaCnpj, maskPhone, comissaoDe, salvarCadastroContador } from '@/lib/contador';

const CARDS = [
  'Seu cliente paga R$59,90/mês',
  'Você ganha R$17,97/mês por CNPJ',
  '80 clientes = R$1.438/mês extra',
];

const VAZIO = { nome: '', escritorio: '', whatsapp: '', cnpj: '' };
const lerRascunho = () => {
  try {
    return JSON.parse(sessionStorage.getItem('cadastro_contador')) || VAZIO;
  } catch {
    return VAZIO;
  }
};

export default function EscritorioTab() {
  const navigate = useNavigate();
  const { data: me, refetch } = useMe();
  const [clientes, setClientes] = useState(80);
  const [form, setForm] = useState(lerRascunho);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!me) {
      sessionStorage.setItem('cadastro_contador', JSON.stringify(form));
      base44.auth.loginWithProvider('google', '/?aba=escritorio');
      return;
    }
    if (!validaCnpj(form.cnpj)) {
      setErro('CNPJ do escritório inválido - confira os 14 dígitos.');
      return;
    }

    setSalvando(true);
    try {
      await salvarCadastroContador({ me, form });
      sessionStorage.removeItem('cadastro_contador');
      await refetch();
      toast({ title: 'Cadastro do escritório pronto', description: 'Agora cadastre seu primeiro cliente.' });
      navigate('/painel-contador');
    } catch (err) {
      setErro('Não foi possível salvar seu cadastro. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-4 pt-10 sm:px-8">
      <motion.h1
        className="font-tech text-2xl font-extrabold leading-tight sm:text-4xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Cada cliente seu pode te pagar <span className="text-[#22C55E]">R$17,97 por mês</span>. Para sempre.
      </motion.h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/75 sm:text-base">
        Sem pacote. Sem mensalidade pra você. Você indica por R$59,90/mês, seu cliente paga direto, você ganha 30%
        recorrente enquanto ele usar.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CARDS.map((texto) => (
          <div key={texto} className="rounded-xl border border-[#334155] bg-[#1E293B] p-6">
            <p className="font-tech text-sm font-bold text-white">{texto}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-[#334155] bg-[#1E293B] p-6">
        <Label htmlFor="s-clientes" className="text-xs uppercase tracking-[0.18em] text-[#94A3B8]">
          Quantos clientes você tem?
        </Label>
        <input
          id="s-clientes"
          type="range"
          min="0"
          max="200"
          value={clientes}
          onChange={(e) => setClientes(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#0F172A] accent-[#22C55E]"
        />
        <p className="mt-4 text-xs text-[#94A3B8]">{clientes} clientes cadastrados</p>
        <p className="mt-1 font-tech text-3xl font-bold text-[#22C55E]">
          Você vai ganhar {brl(comissaoDe(clientes))}/mês extra
        </p>
      </div>

      <form onSubmit={salvar} className="mt-6 rounded-xl border border-[#334155] bg-[#1E293B] p-6">
        <h2 className="font-tech text-base font-bold">Cadastre seu escritório e comece a ganhar hoje</h2>
        <p className="mt-1 text-xs text-[#94A3B8]">
          {me ? 'Leva 30 segundos. Depois é só cadastrar os CNPJs dos seus clientes.' : 'Entre com o Google para salvar seu cadastro.'}
        </p>

        {erro && <div className="mt-4 rounded-lg bg-[#ef4444]/15 p-3 text-sm text-[#fecaca]">{erro}</div>}

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="o-contador-nome" className="text-xs text-[#94A3B8]">Seu nome</Label>
              <Input
                id="o-contador-nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Ana Contadora"
                className="h-12 border-[#334155] bg-[#0F172A] text-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-contador-esc" className="text-xs text-[#94A3B8]">Escritório</Label>
              <Input
                id="o-contador-esc"
                value={form.escritorio}
                onChange={(e) => setForm({ ...form, escritorio: e.target.value })}
                placeholder="Ex: Contabilidade Silva"
                className="h-12 border-[#334155] bg-[#0F172A] text-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-contador-zap" className="text-xs text-[#94A3B8]">WhatsApp</Label>
              <Input
                id="o-contador-zap"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })}
                placeholder="(11) 99999-9999"
                className="h-12 border-[#334155] bg-[#0F172A] text-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-contador-cnpj" className="text-xs text-[#94A3B8]">CNPJ</Label>
              <Input
                id="o-contador-cnpj"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: maskCnpj(e.target.value) })}
                placeholder="00.000.000/0000-00"
                className="h-12 border-[#334155] bg-[#0F172A] text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] text-[16px] font-bold text-black transition animate-pulse hover:bg-[#16a34a] disabled:opacity-70"
          >
            {salvando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Criando seu cadastro...
              </>
            ) : (
              <>
                CRIAR MEU CADASTRO E VER MEU PAINEL <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-[#94A3B8]">Sem mensalidade pra você. Você só ganha quando o cliente paga.</p>
        </div>
      </form>
    </div>
  );
}