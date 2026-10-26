import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ScanFace } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import PasswordInput from '@/components/PasswordInput';
import { mascaraCpf, onlyDigits } from '@/lib/format';

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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
        <Link to="/entrar/funcionario/criar-acesso" className="font-medium text-primary hover:underline">
          Criar meu acesso
        </Link>
        <span className="h-3 w-px bg-white/15" />
        <Link to="/entrar/funcionario/esqueci-senha" className="font-medium text-primary hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        O primeiro acesso usa o CPF e o e-mail que o seu RH cadastrou na sua ficha. Se aparecer “CPF não encontrado”,
        peça ao RH para cadastrar o seu acesso.
      </p>
    </AuthLayout>
  );
}