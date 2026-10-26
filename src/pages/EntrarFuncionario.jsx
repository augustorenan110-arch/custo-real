import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Lock, ScanFace } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { onlyDigits } from '@/lib/format';

const mascaraCpf = (v) =>
  onlyDigits(v)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');

export default function EntrarFuncionario() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const entrar = async (e) => {
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
      const email = resposta?.data?.email;
      if (!email) throw new Error('CPF não encontrado.');
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = '/meu';
    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || 'Senha incorreta. Confira os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={ScanFace}
      title="Entrar como Funcionário"
      subtitle="Bata seu ponto facial e veja seus holerites"
      footer={
        <Link to="/entrar" className="text-primary font-medium hover:underline">
          Trocar de perfil
        </Link>
      }
    >
      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <form onSubmit={entrar} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            autoComplete="username"
            value={mascaraCpf(cpf)}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 pl-10"
              required
            />
          </div>
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

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Primeiro acesso? Abra o convite que o seu RH enviou por e-mail para criar a senha e depois entre aqui com o
        seu CPF. Se aparecer “CPF não encontrado”, peça ao RH para cadastrar o seu acesso.
      </p>
    </AuthLayout>
  );
}