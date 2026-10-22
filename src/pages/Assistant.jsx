import { useState } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SUGGESTIONS = [
  'Quem fez mais horas extras este mês?',
  'Quais despesas fora da política estão pendentes?',
  'Quem bateu ponto fora da unidade?',
];

export default function Assistant() {
  const { data: me, isLoading } = useMe();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (me?.role !== 'admin') {
    return <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Apenas o RH usa o assistente.</div>;
  }

  async function ask(q) {
    const text = (q ?? question).trim();
    if (!text || busy) return;
    setQuestion('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setBusy(true);
    try {
      const { data } = await base44.functions.invoke('hrAssistant', { question: text });
      setMessages((m) => [...m, { role: 'ai', text: data.answer }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Não consegui responder agora. Tente de novo.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Bot className="h-6 w-6 text-primary" /> Assistente IA
        </h1>
        <p className="text-sm text-muted-foreground">Pergunte sobre ponto, horas extras e gastos dos colaboradores.</p>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="glass rounded-full px-3 py-1.5 text-xs hover:border-primary/40">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-2xl p-3 text-sm ${m.role === 'user' ? 'ml-8 bg-primary/15' : 'glass mr-8'}`}>
            {m.role === 'ai' ? <ReactMarkdown className="prose prose-sm prose-invert max-w-none">{m.text}</ReactMarkdown> : m.text}
          </div>
        ))}
        {busy && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex gap-2">
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pergunte algo…" className="field" />
        <Button type="submit" disabled={busy || !question.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}