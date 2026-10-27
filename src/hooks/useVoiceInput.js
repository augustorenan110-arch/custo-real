import { useEffect, useRef, useState } from 'react';

/** Ditado por voz (webkitSpeechRecognition) com suporte a celular. */
export function useVoiceInput({ onText }) {
  const recRef = useRef(null);
  const onTextRef = useRef(onText);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  useEffect(() => {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return undefined;
    const rec = new Rec();
    rec.lang = 'pt-BR';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      let texto = '';
      for (let i = 0; i < event.results.length; i += 1) texto += event.results[i][0].transcript;
      onTextRef.current?.(texto.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setSupported(true);
    return () => {
      try {
        rec.abort();
      } catch {
        /* ignora */
      }
    };
  }, []);

  const start = () => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stop = () => {
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        /* ignora */
      }
    }
    setListening(false);
  };

  return { listening, supported, start, stop };
}