import { Link } from 'react-router-dom';
import { ScanFace, Check } from 'lucide-react';

/** Card verde no final do Painel: ponto facial funciona no navegador, sem baixar app. */
export default function FacialPontoCard() {
  return (
    <div className="rounded-2xl border border-success/40 bg-success/10 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/20 text-success">
          <Check className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-sm font-bold leading-snug text-foreground">
            ✅ Ponto Facial funcionando 100% aqui no navegador — Sem precisar baixar nada
          </p>
          <Link
            to="/ponto"
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <ScanFace className="h-5 w-5" /> Bater Ponto Facial Agora
          </Link>
        </div>
      </div>
    </div>
  );
}