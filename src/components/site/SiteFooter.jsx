import { MessageCircle, Mail } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-3xl px-5 py-8 text-center">
        <p className="font-heading text-sm font-semibold text-foreground">Custo Real - Gestão de Empresas</p>
        <p className="mt-3 text-sm text-muted-foreground">Precisa de ajuda?</p>
        <div className="mt-2 flex flex-col items-center gap-1.5 text-sm">
          <a
            href="https://wa.me/5518997046427"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-foreground transition hover:text-primary"
          >
            <MessageCircle className="h-4 w-4 text-save-tech" />
            WhatsApp: (18) 99704-6427
          </a>
          <a
            href="mailto:rhcustoreal@gmail.com"
            className="inline-flex items-center gap-2 text-foreground transition hover:text-primary"
          >
            <Mail className="h-4 w-4 text-primary" />
            E-mail: rhcustoreal@gmail.com
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Atendimento: Segunda a Sexta, das 8h às 18h</p>
        <p className="mt-4 border-t border-white/10 pt-4 text-[11px] text-muted-foreground">
          © 2026 Custo Real - Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}