import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { base44 } from '@/api/base44Client';

// Menu "Mais" do celular: lista as telas que não cabem na barra inferior.
export default function MoreMenu({ items }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] text-muted-foreground"
      >
        <Menu className="h-[22px] w-[22px]" strokeWidth={1.7} />
        Mais
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Mais</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-1">
            {items.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-white/5"
              >
                <n.icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
                {n.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                base44.auth.logout('/login');
              }}
              className="mt-1 flex items-center gap-3 rounded-xl border-t border-white/10 px-3 pt-3 pb-1 text-sm text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.7} /> Sair
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}