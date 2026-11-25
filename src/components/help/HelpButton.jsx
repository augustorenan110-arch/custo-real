import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import HelpFAQ from './HelpFAQ';

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Central de Ajuda"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-1 ring-white/10 transition hover:bg-primary/90 sm:bottom-6 sm:right-6"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Central de Ajuda</DialogTitle>
            <DialogDescription>Perguntas frequentes — clique para ver a resposta.</DialogDescription>
          </DialogHeader>
          <HelpFAQ />
        </DialogContent>
      </Dialog>
    </>
  );
}