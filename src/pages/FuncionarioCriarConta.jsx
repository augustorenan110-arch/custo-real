import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';
import { mascaraCpf, onlyDigits } from '@/lib/format';

const CAMPO = 'h-12 pl-10';
const ICONE = 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground';

export default function FuncionarioCriarConta() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [etapaOtp, setEtapaOtp] = useState(false);
  const [jaTemAcesso, setJaTemAcesso] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const criar = async (e) => {
    e.preventDefault();
    setError('');
    setJaTemAcesso(false);
    const digitos = onlyDigits(cpf);
    if (digitos.length !== 11) {
      setError('Informe seu CPF completo (11 dígitos).');
      return;
    }
    if (password.length < 8) {
      setError('Crie uma senha com pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    let emailFicha = '';
    try {
      const resposta = await base44.functions.invoke('loginFuncionario', { cpf: digitos });
      emailFicha = resposta?.data?.email || '';
      if (!emailFicha) throw new Error('CPF não encontrado. Peça ao RH para cadastrar o seu acesso.');
      await base44.auth.register({ email: emailFicha, password });
      setEmail(emailFicha);
      setEtapaOtp(true);
    } catch (err) {
      if (emailFicha) {
        // A ficha existe e o acesso já havia sido criado pelo RH: falta só a senha.
        setJaTemAcesso(true);
      } else {
        setError(err?.response?.data?.error || err?.message || 'Não foi possível criar o acesso. Confira os dados.');
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
      window.location.href = '/meu';
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
        footer={
          <Link to="/entrar/funcionario" className="font-medium text-primary hover:underline">
            <ArrowLeft className="mr-1 inline h-3 w-3" />Voltar para o login
          </Link>
        }
      >
        {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirmando...
            </>
          ) : (
            'Confirmar e entrar'
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
      title="Criar meu acesso"
      subtitle="Use o CPF da sua ficha e crie uma senha para bater o ponto e ver seus holerites"
      footer={
        <Link to="/entrar/funcionario" className="font-medium text-primary hover:underline">
          <ArrowLeft className="mr-1 inline h-3 w-3" />Voltar para o login
        </Link>
      }
    >
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {jaTemAcesso && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          <p className="font-medium">Esse CPF já tem acesso criado.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Entre com a senha que você já usa. Se esqueceu,{' '}
            <Link to="/entrar/funcionario/esqueci-senha" className="font-medium text-primary hover:underline">
              recupere aqui
            </Link>
            .
          </p>
        </div>
      )}

      <form onSubmit={criar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            value={mascaraCpf(cpf)}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Crie sua senha</Label>
          <div className="relative">
            <Lock className={ICONE} />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
              className={CAMPO}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmar">Confirmar senha</Label>
          <div className="relative">
            <Lock className={ICONE} />
            <Input
              id="confirmar"
              type="password"
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="••••••••"
              className={CAMPO}
              required
            />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando acesso...
            </>
          ) : (
            'Criar meu acesso'
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        O código de confirmação vai para o e-mail que o seu RH cadastrou na sua ficha.
      </p>
    </AuthLayout>
  );
}