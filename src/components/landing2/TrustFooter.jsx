import { Building2, Activity, Award } from 'lucide-react';

const ITEMS = [
  { icon: Building2, text: 'Utilizado por 500+ empresas' },
  { icon: Activity, text: '99.9% uptime' },
  { icon: Award, text: 'SOC 2 Certificado' },
];

const LOGOS = ['Techco', 'Nexus', 'Altum'];

export default function TrustFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 py-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <span key={it.text} className="inline-flex items-center gap-2 text-sm text-white/65">
                <Icon className="h-4 w-4 text-primary" /> {it.text}
              </span>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 opacity-50">
          {LOGOS.map((l) => (
            <span key={l} className="font-display text-sm font-bold tracking-[0.2em] text-white/60">
              {l.toUpperCase()}
            </span>
          ))}
        </div>

        <p className="mt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Custo Real · RH IA. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}