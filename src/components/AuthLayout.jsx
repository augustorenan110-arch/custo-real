import React from "react";
import { Link } from "react-router-dom";
import { Logo, Wordmark } from "@/components/Brand";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex flex-col items-center gap-3">
          <Logo className="h-16" />
          <Wordmark size="lg" />
        </Link>
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="glass glow rounded-3xl p-6 sm:p-8">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Custo Real · RH IA. Sua empresa mais forte.
        </p>
      </div>
    </div>
  );
}