import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo, Wordmark } from '@/components/Brand';

const blocks = [
  {
    title: 'Quais dados coletamos',
    body: 'Nome, e-mail, vínculo com a empresa, despesas enviadas, recibos anexados e o resultado da conferência automática de política. Não coletamos localização, contatos ou dados de navegação para publicidade.',
  },
  {
    title: 'Para que usamos',
    body: 'Os dados são usados exclusivamente para registrar, conferir e aprovar despesas corporativas, gerar os resumos de custo da empresa e manter o histórico de reembolsos.',
  },
  {
    title: 'Inteligência artificial',
    body: 'O recibo enviado pode ser analisado por um modelo de IA para extrair valor, data e estabelecimento e comparar com a política de despesas da empresa. O resultado é sempre revisado pelo RH antes da aprovação.',
  },
  {
    title: 'Compartilhamento',
    body: 'Suas despesas ficam visíveis para você e para os administradores de RH da sua empresa. Não vendemos nem compartilhamos dados com terceiros para fins de marketing.',
  },
  {
    title: 'Armazenamento e segurança',
    body: 'Recibos são armazenados em área privada, acessível apenas por você e pelo RH por meio de links temporários. O acesso é protegido por autenticação de conta.',
  },
  {
    title: 'Seus direitos',
    body: 'Você pode solicitar a correção ou a exclusão dos seus dados a qualquer momento pelo e-mail de suporte da sua empresa. Ao excluir a conta, os recibos e despesas associados são removidos.',
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Logo className="h-9" />
          <Wordmark size="sm" />
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-2xl font-bold sm:text-3xl">Política de privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: outubro de 2026 · Custo Real RH IA
        </p>

        <div className="mt-8 space-y-4">
          {blocks.map((b) => (
            <section key={b.title} className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-primary">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">{b.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Este documento serve como URL de política de privacidade para as lojas de aplicativos. Ajuste os textos
          conforme as regras da sua empresa e as exigências legais aplicáveis.
        </p>
      </main>
    </div>
  );
}