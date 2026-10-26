import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import PasswordInput from '@/components/PasswordInput';
import GoogleIcon from '@/components/GoogleIcon';
import { useAuth } from '@/lib/AuthContext';
import { safeReturnTo } from '@/lib/authReturnTo';

export default function EntrarEmpresa() {
  const navigate = useNavigate();
  const { isAuthenticated, authChecked, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  // Empresa que já está logada não passa pela tela de login de novo.
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    navigate(user?.role === 'admin' ? returnTo : '/meu', { replace: true });
  }, [authChecked, isAuthenticated, user?.role, returnTo, navigate]);

  const entrar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch {
      setError('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Building2}
      title="Entrar como Empresa"
      subtitle="Acesso do RH: funcionários, ponto, despesas e custo real"
      footer={
        <Link to="/entrar" className="text-primary font-medium hover:underline">
          Trocar de perfil
        </Link>
      }
    >
      <button
        type="button"
        onClick={() => base44.auth.loginWithProvider('google', returnTo)}
        className="mb-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#DADCE0] bg-[#FFFFFF] text-sm font-medium text-[#3C4043] transition hover:bg-[#F8F9FA]"
      >
        <GoogleIcon className="h-5 w-5" />
        Continuar com Google
      </button>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={entrar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail da empresa</Label>
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
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Primeiro acesso?{' '}
        <Link to="/entrar/empresa/cadastro" className="font-medium text-primary hover:underline">
          Cadastre sua empresa
        </Link>
      </p>
    </AuthLayout>
  );
}