import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';
import { onlyDigits, cnpjBR } from '@/lib/format';

// Máscara enquanto digita: 00.000.000/0000-00
const mascaraCnpj = (v) =>
  onlyDigits(v)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

export default function EmpresaCadastro() {
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [etapaOtp, setEtapaOtp] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);

  const cadastrar = async (e) => {
    e.preventDefault();
    setError('');
    if (onlyDigits(cnpj).length !== 14) {
      setError('Informe um CNPJ válido (14 dígitos).');
      return;
    }
    if (nome.trim().length < 2) {
      setError('Informe o nome da empresa.');
      return;
    }
    if (password !== confirmar) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setEtapaOtp(true);
    } catch {
      setError(
        'Não foi possível criar a conta. Este e-mail já pode estar cadastrado ou a senha é fraca (use 8+ caracteres).',
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmarCodigo = async () => {
    setError('');
    setLoading(true);
    try {
      const resultado = await base44.auth.verifyOtp({ email, otpCode });
      if (resultado?.access_token) base44.auth.setToken(resultado.access_token);
      try {
        await base44.functions.invoke('empresaSignup', { cnpj: onlyDigits(cnpj), nome });
      } catch (err) {
        // A conta já existe: o painel abre mesmo assim, com o cadastro pendente.
        setAviso(err?.response?.data?.error || 'Não foi possível registrar a empresa agora.');
      }
      window.location.href = '/painel';
    } catch {
      setError('Código inválido ou expirado. Confira o e-mail e tente de novo.');
      setLoading(false);
    }
  };

  if (etapaOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Confirme seu e-mail"
        subtitle={`Enviamos um código para ${email}`}
      >
        {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {aviso && <div className="mb-4 rounded-lg bg-warning/15 p-3 text-sm">{aviso}</div>}
        <div className="mb-6 flex justify-center">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="h-12 w-full font-medium"
          onClick={confirmarCodigo}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando sua empresa...
            </>
          ) : (
            'Verificar e entrar'
          )}
        </Button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não recebeu o código?{' '}
          <button
            type="button"
            onClick={() => base44.auth.resendOtp(email).catch(() => {})}
            className="font-medium text-primary hover:underline"
          >
            Reenviar código
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Cadastrar minha empresa"
      subtitle="7 dias grátis no PREMIUM · você entra como administrador (RH)"
      footer={
        <Link to="/entrar/empresa" className="text-primary font-medium hover:underline">
          Já tenho conta · Entrar
        </Link>
      }
    >
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={cadastrar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            inputMode="numeric"
            value={mascaraCnpj(cnpj)}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da empresa</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Minha Empresa LTDA"
              className="h-12 pl-10"
              required
            />
          </div>
          {cnpjBR(onlyDigits(cnpj)) !== '—' && (
            <p className="text-[11px] text-muted-foreground">CNPJ {cnpjBR(onlyDigits(cnpj))}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail do responsável</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              className="h-12 pl-10"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmar"
                type="password"
                autoComplete="new-password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••"
                className="h-12 pl-10"
                required
              />
            </div>
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...
            </>
          ) : (
            'Criar conta da empresa'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}