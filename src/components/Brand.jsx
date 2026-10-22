import logo from '@/assets/logo-cr.png';

export function Logo({ className = 'h-16' }) {
  return <img src={logo} alt="Custo Real" className={`w-auto ${className}`} />;
}

export function Wordmark({ size = 'lg' }) {
  const big = size === 'lg';
  return (
    <div className="inline-flex flex-col items-center">
      <span
        className={`font-display font-extrabold leading-none tracking-tight ${
          big ? 'text-3xl sm:text-4xl' : 'text-base'
        }`}
      >
        CUSTO <span className="text-primary">REAL</span>
      </span>
      <span
        className={`mt-1 flex w-full items-center gap-2 text-muted-foreground ${
          big ? 'text-xs tracking-[0.35em] sm:text-sm' : 'text-[9px] tracking-[0.3em]'
        }`}
      >
        <span className="h-px flex-1 bg-primary/60" />
        RH IA
        <span className="h-px flex-1 bg-primary/60" />
      </span>
    </div>
  );
}

export function BrandInline() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo className="h-9" />
      <Wordmark size="sm" />
    </div>
  );
}

export function BrandFooter() {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Logo className="h-6" />
      <div>
        <div className="font-semibold">Custo Real</div>
        <div className="text-muted-foreground">RH IA. Sua empresa mais forte.</div>
      </div>
    </div>
  );
}

export function Initials({ name = '', className = 'h-10 w-10' }) {
  const ini = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-primary/20 font-semibold text-primary ring-1 ring-primary/30 ${className}`}
    >
      {ini || '?'}
    </div>
  );
}