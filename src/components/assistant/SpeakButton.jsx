import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';

const textoFalado = (t) =>
  String(t || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_#>`|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Lê a resposta em voz alta com speechSynthesis. */
export default function SpeakButton({ text }) {
  const [falando, setFalando] = useState(false);

  useEffect(
    () => () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const falar = () => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (falando) {
      synth.cancel();
      setFalando(false);
      return;
    }
    const fala = new SpeechSynthesisUtterance(textoFalado(text));
    fala.lang = 'pt-BR';
    fala.rate = 1;
    fala.onend = () => setFalando(false);
    fala.onerror = () => setFalando(false);
    synth.cancel();
    synth.speak(fala);
    setFalando(true);
  };

  return (
    <button
      type="button"
      onClick={falar}
      title={falando ? 'Parar leitura' : 'Ouvir resposta'}
      className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {falando ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}