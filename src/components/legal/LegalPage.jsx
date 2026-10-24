import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo, Wordmark } from '@/components/Brand';

export default function LegalPage({ title, updated, sections, children }) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-9" />
          <Wordmark size="sm" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{updated}</p>

        {children}

        <div className="mt-8 space-y-4">
          {sections.map((b) => (
            <section key={b.title} className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-primary">{b.title}</h2>
              {b.body && <p className="mt-2 text-sm leading-relaxed text-foreground/75">{b.body}</p>}
              {b.bullets && (
                <ul className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-foreground/75">
                  {b.bullets.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="glass mt-8 rounded-2xl p-5 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground/85">Custo Real · CNPJ 00.000.000/0001-00</p>
          <p className="mt-1">
            Encarregado de Dados (DPO): dpo@custoreal.com.br · custo-real.com
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacidade" className="transition hover:text-foreground">Política de Privacidade</Link>
            <Link to="/termos" className="transition hover:text-foreground">Termos de Uso</Link>
            <Link to="/excluir-dados" className="transition hover:text-foreground">Excluir meus dados</Link>
          </p>
        </div>
      </main>
    </div>
  );
}