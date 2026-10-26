import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { mascaraCpf, onlyDigits } from '@/lib/format';

// Mostra só o começo do e-mail para o funcionário reconhecer o endereço da ficha.
const mascararEmail = (mail) => {
  const [usuario = '', dominio = ''] = String(mail || '').split('@');
  if (!dominio) return '';
  return `${usuario.slice(0, 2)}${'*'.repeat(Math.max(usuario.length - 2, 3))}@${dominio}`;
};

export default function FuncionarioRecuperarSenha() {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    const digitos = onlyDigits(cpf);
    if (digitos.length !== 11) {
      setError('Informe seu CPF completo (11 dígitos).');
      return;
    }

    setLoading(true);
    try {
      const resposta = await base44.functions.invoke('loginFuncionario', { cpf: digitos });
      const emailFicha = resposta?.data?.email || '';
      if (emailFicha) {
        await base44.auth.resetPasswordRequest(emailFicha);
        setEmail(emailFicha);
      }
    } catch {
      // Nunca revelamos se o CPF está cadastrado: a tela mostra o mesmo aviso.
    } finally {
      setLoading(false);
      setEnviado(true);
    }
  };

  if (enviado) {
    return (
      <AuthLayout
        icon={KeyRound}
        title="Confira seu e-mail"
        subtitle="Enviamos o link para você criar uma nova senha"
        footer={
          <Link to="/entrar/funcionario" className="font-medium text-primary hover:underline">
            <ArrowLeft className="mr-1 inline h-3 w-3" />Voltar para o login
          </Link>
        }
      >
        <p className="text-center text-sm">
          Se este CPF estiver cadastrado na sua ficha, o link de redefinição já está no caminho
          {email ? (
            <>
              {' '}
              para <span className="font-medium">{mascararEmail(email)}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Abra o link, crie a nova senha e depois entre aqui com o CPF e a senha nova. Não chegou nada? Confira a caixa
          de spam ou peça ao RH para conferir o e-mail da sua ficha.
        </p>
        <Button
          variant="outline"
          className="mt-5 h-12 w-full font-medium"
          onClick={() => {
            setEnviado(false);
            setCpf('');
          }}
        >
          Tentar outro CPF
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={KeyRound}
      title="Esqueci minha senha"
      subtitle="Informe seu CPF e enviamos o link de redefinição para o e-mail da sua ficha"
      footer={
        <Link to="/entrar/funcionario" className="font-medium text-primary hover:underline">
          <ArrowLeft className="mr-1 inline h-3 w-3" />Voltar para o login
        </Link>
      }
    >
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={enviar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            autoComplete="username"
            autoFocus
            value={mascaraCpf(cpf)}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="h-12"
            required
          />
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            'Enviar link de redefinição'
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Ainda não tem acesso?{' '}
        <Link to="/entrar/funcionario/criar-acesso" className="font-medium text-primary hover:underline">
          Crie sua senha aqui
        </Link>
        .
      </p>
    </AuthLayout>
  );
}