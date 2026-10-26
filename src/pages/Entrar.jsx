import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ScanFace } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AuthLayout from '@/components/AuthLayout';

const OPCOES = [
  {
    to: '/entrar/empresa',
    icon: Building2,
    titulo: 'Sou Empresa',
    texto: 'Cadastrar funcionários, bater ponto e acompanhar o custo real.',
  },
  {
    to: '/entrar/funcionario',
    icon: ScanFace,
    titulo: 'Sou Funcionário',
    texto: 'Bater meu ponto facial e ver meus holerites.',
  },
];

export default function Entrar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, authChecked } = useAuth();

  // Quem já entrou vai direto para a tela do seu perfil.
  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    navigate(user?.role === 'admin' ? '/painel' : '/meu', { replace: true });
  }, [authChecked, isAuthenticated, user?.role, navigate]);

  return (
    <AuthLayout
      icon={Building2}
      title="Como você vai entrar?"
      subtitle="Escolha o seu perfil para continuar"
      footer={
        <Link to="/" className="text-primary font-medium hover:underline">
          Voltar para o site
        </Link>
      }
    >
      <div className="space-y-3">
        {OPCOES.map((o) => (
          <Link
            key={o.to}
            to={o.to}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 transition hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <o.icon className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">{o.titulo}</span>
              <span className="block text-xs text-muted-foreground">{o.texto}</span>
            </span>
          </Link>
        ))}
      </div>
    </AuthLayout>
  );
}