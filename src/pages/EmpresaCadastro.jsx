import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';
import GoogleIcon from '@/components/GoogleIcon';
import { useAuth } from '@/lib/AuthContext';
import { onlyDigits } from '@/lib/format';
import { emailJaCadastrado } from '@/lib/authErrors';

// Máscara enquanto digita: 00.000.000/0000-00
const mascaraCnpj = (v) =>
  onlyDigits(v)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

const GOOGLE_RETURN = '/entrar/empresa/cadastro';

export default function EmpresaCadastro() {
  const { authChecked, isAuthenticated } = useAuth();
  const [cnpj, setCnpj] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [etapaOtp, setEtapaOtp] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);
  const [jaLogado, setJaLogado] = useState(false);

  // Quem volta do Google já está autenticado: pula e-mail/senha/código e só preenche a empresa.
  useEffect(() => {
    if (authChecked && isAuthenticated) setJaLogado(true);
  }, [authChecked, isAuthenticated]);

  const entrarComGoogle = () => base44.auth.loginWithProvider('google', GOOGLE_RETURN);

  // Fluxo Google (ou quem já entrou): só cadastra a empresa, sem código de e-mail.
  const finalizarEmpresa = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (onlyDigits(cnpj).length !== 14) {
      setError('Informe um CNPJ válido (14 dígitos).');
      return;
    }
    if (nome.trim().length < 2) {
      setError('Informe o nome da empresa.');
      return;
    }
    setLoading(true);
    try {
      await base44.functions.invoke('empresaSignup', { cnpj: onlyDigits(cnpj), nome, responsavel });
      window.location.href = '/painel';
    } catch (err) {
      setError(err?.response?.data?.error || 'Não foi possível concluir o cadastro da empresa.');
    } finally {
      setLoading(false);
    }
  };

  // Fluxo e-mail/senha: cria a conta e vai para a tela de código (verificação obrigatória do Base44).
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
    } catch (err) {
      if (emailJaCadastrado(err)) {
        setError('Este e-mail já está cadastrado. Faça login em "Já tenho conta · Entrar" ou use outro e-mail.');
      } else {
        setError('Não foi possível criar a conta. Verifique os dados ou use uma senha mais forte (8+ caracteres).');
      }
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
        await base44.functions.invoke('empresaSignup', { cnpj: onlyDigits(cnpj), nome, responsavel });
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
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">ou</span>
          </div>
        </div>
        <button
          type="button"
          onClick={entrarComGoogle}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-medium transition hover:bg-accent"
        >
          <GoogleIcon className="h-5 w-5" /> Continuar com Google (sem código)
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Se o código não chegar, entre com o Google e complete o cadastro da empresa.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title={jaLogado ? 'Complete o cadastro da empresa' : 'Cadastrar minha empresa'}
      subtitle="7 dias grátis no PREMIUM · você entra como administrador (RH)"
      footer={
        <Link to="/entrar/empresa" className="text-primary font-medium hover:underline">
          Já tenho conta · Entrar
        </Link>
      }
    >
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {!jaLogado && (
        <>
          <button
            type="button"
            onClick={entrarComGoogle}
            className="mb-5 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#DADCE0] bg-[#FFFFFF] text-sm font-medium text-[#3C4043] transition hover:bg-[#F8F9FA]"
          >
            <GoogleIcon className="h-5 w-5" />
            Continuar com Google
          </button>
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">ou cadastre com e-mail</span>
            </div>
          </div>
        </>
      )}

      <form onSubmit={jaLogado ? finalizarEmpresa : cadastrar} className="space-y-4">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsavel">Nome do responsável</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Seu nome completo"
              className="h-12 pl-10"
              required
            />
          </div>
        </div>

        {!jaLogado && (
          <>
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
          </>
        )}

        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {jaLogado ? 'Criando empresa...' : 'Criando conta...'}
            </>
          ) : jaLogado ? (
            'Criar empresa'
          ) : (
            'Criar conta da empresa'
          )}
        </Button>
      </form>

      {jaLogado && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Você entrou com o Google. Preencha os dados da empresa para concluir.
        </p>
      )}
    </AuthLayout>
  );
}