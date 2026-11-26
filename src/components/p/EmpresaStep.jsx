import { useEffect, useState } from 'react';
import { Loader2, ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import LockedCard from '@/components/p/LockedCard';
import { maskCnpj, validaCnpj } from '@/lib/contador';
import { toast } from '@/components/ui/use-toast';

// Card informativo: o que fica bloqueado até concluir o cadastro da empresa.
const BLOQUEADOS = [
  { titulo: 'Ponto facial com prova de vida', nota: 'Bloqueado - cadastre empresa' },
  { titulo: 'Ranking de custo real', nota: 'Bloqueado - cadastre empresa' },
  { titulo: 'Simulador de rescisão R$ 5.838', nota: 'Bloqueado - cadastre empresa' },
];

export default function EmpresaStep({ nome, email = '', onCreated }) {
  const [etapa, setEtapa] = useState('form');
  const [form, setForm] = useState({ cnpj: '', nome_fantasia: '', funcionarios: '1', email });
  const [otpCode, setOtpCode] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [contador, setContador] = useState(0);

  // Contagem regressiva de 60s para o botão "Reenviar código".
  useEffect(() => {
    if (etapa !== 'codigo' || contador <= 0) return;
    const t = setTimeout(() => setContador((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [etapa, contador]);

  const enviarCodigo = async (e) => {
    e?.preventDefault?.();
    setErro('');
    if (!validaCnpj(form.cnpj)) {
      setErro('CNPJ inválido — confira os 14 dígitos.');
      return;
    }
    if (form.nome_fantasia.trim().length < 2) {
      setErro('Informe o nome da empresa.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setErro('Informe um e-mail válido para receber o código.');
      return;
    }
    setEnviando(true);
    try {
      const res = await base44.functions.invoke('empresaOtp', {
        action: 'enviar',
        email: form.email,
        cnpj: form.cnpj,
        nome: form.nome_fantasia,
        funcionarios: Number(form.funcionarios) || 0,
      });
      setOtpCode('');
      setContador(60);
      setEtapa('codigo');
      return res;
    } catch (err) {
      setErro(err?.response?.data?.error || 'Não conseguimos enviar. Tente novamente ou fale no suporte.');
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    if (contador > 0 || enviando) return;
    setErro('');
    setEnviando(true);
    try {
      await base44.functions.invoke('empresaOtp', {
        action: 'reenviar',
        email: form.email,
        cnpj: form.cnpj,
        nome: form.nome_fantasia,
        funcionarios: Number(form.funcionarios) || 0,
      });
      setOtpCode('');
      setContador(60);
    } catch (err) {
      setErro(err?.response?.data?.error || 'Não conseguimos enviar. Tente novamente ou fale no suporte.');
    } finally {
      setEnviando(false);
    }
  };

  const verificar = async () => {
    setErro('');
    setVerificando(true);
    try {
      await base44.functions.invoke('empresaOtp', { action: 'verificar', email: form.email, code: otpCode });
      // Código confirmado: cria a empresa e promove quem cadastrou a ADMIN.
      const res = await base44.functions.invoke('empresaSignup', {
        cnpj: form.cnpj,
        nome: form.nome_fantasia,
        employee_count: Number(form.funcionarios) || 0,
      });
      toast({ title: 'Empresa cadastrada!', description: 'Você é o administrador da empresa.' });
      onCreated?.(res?.data || res);
    } catch (err) {
      setErro(err?.response?.data?.error || 'Não foi possível concluir o cadastro da empresa.');
    } finally {
      setVerificando(false);
    }
  };

  if (etapa === 'codigo') {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-xl font-semibold">Confirme seu e-mail</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um código de 6 dígitos para <span className="font-medium text-foreground">{form.email}</span>. Ele vale por 10 minutos.
          </p>
        </header>

        <div className="glass rounded-2xl p-5">
          {erro && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</div>}
          <div className="mb-5 flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button
            onClick={verificar}
            disabled={verificando || otpCode.length < 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#007bff] text-base font-semibold text-white transition hover:bg-[#0064d2] disabled:opacity-60"
          >
            {verificando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
              </>
            ) : (
              <>
                Verificar e cadastrar <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              onClick={() => {
                setEtapa('form');
                setErro('');
              }}
              className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Alterar e-mail
            </button>
            <button
              onClick={reenviar}
              disabled={contador > 0 || enviando}
              className="font-medium text-primary hover:underline disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : contador > 0 ? `Reenviar em ${contador}s` : 'Reenviar código'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {BLOQUEADOS.map((b) => (
            <LockedCard key={b.titulo} titulo={b.titulo} nota={b.nota} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold">Olá, {nome || 'chefe'}! Vamos calcular seu passivo real em 30 segundos.</h1>
      </header>

      <form onSubmit={enviarCodigo} className="cta-blue rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Passo 1 de 3</p>
        <h2 className="mt-1 font-display text-lg font-bold text-white">Cadastre sua primeira empresa</h2>

        {erro && <div className="mt-3 rounded-lg bg-black/25 p-3 text-sm text-white">{erro}</div>}

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="o-cnpj" className="text-xs text-white/85">CNPJ</Label>
            <Input
              id="o-cnpj"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: maskCnpj(e.target.value) })}
              placeholder="00.000.000/0000-00"
              className="h-12 border-white/25 bg-white/95 text-slate-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-nome" className="text-xs text-white/85">Nome fantasia</Label>
            <Input
              id="o-nome"
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              placeholder="Ex: Mercado Bom Preço"
              className="h-12 border-white/25 bg-white/95 text-slate-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-func" className="text-xs text-white/85">Quantos funcionários?</Label>
            <Input
              id="o-func"
              type="number"
              min="1"
              max="100"
              value={form.funcionarios}
              onChange={(e) => setForm({ ...form, funcionarios: e.target.value })}
              className="h-12 border-white/25 bg-white/95 text-slate-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-email" className="text-xs text-white/85">E-mail para receber o código</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="o-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com.br"
                className="h-12 border-white/25 bg-white/95 pl-10 text-slate-900"
                required
              />
            </div>
            <p className="text-[11px] text-white/70">É para este e-mail que enviaremos o código de verificação.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#007bff] text-base font-semibold text-white transition hover:bg-[#0064d2] disabled:opacity-60"
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando código...
            </>
          ) : (
            <>
              Enviar código e calcular <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="space-y-2">
        {BLOQUEADOS.map((b) => (
          <LockedCard key={b.titulo} titulo={b.titulo} nota={b.nota} />
        ))}
      </div>
    </div>
  );
}