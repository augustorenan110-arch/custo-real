import { useEffect, useState } from 'react';
import { Bot, Mic, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import SpeakButton from '@/components/assistant/SpeakButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AGENT = 'workbank_assistant';

const SUGGESTIONS = [
  'Quanto custa um funcionário de R$ 2.000 na verdade?',
  'Quem fez mais horas extras esse mês?',
  'Quais despesas estão fora da política?',
  'Quem bateu ponto fora da unidade?',
  'Qual funcionário está me dando mais prejuízo?',
  'Quanto vou gastar pra demitir alguém hoje?',
  'Quem está faltando muito e gerando risco trabalhista?',
  'Qual o ranking dos mais caros pra empresa?',
  'Quanto já gastei de extra e adicional esse mês?',
  'Me mostra o relatório de auditoria para processo.',
];

export default function Assistant() {
  const { data: me, isLoading } = useMe();
  const [conversationId, setConversationId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const { listening, supported, start, stop } = useVoiceInput({ onText: setQuestion });

  useEffect(() => {
    if (isLoading || me?.role !== 'admin') return undefined;
    let ativo = true;
    (async () => {
      const lista = await base44.agents.listConversations({ agent_name: AGENT });
      const existente = (Array.isArray(lista) ? lista : lista?.items ?? [])[0];
      if (!ativo) return;
      if (existente) {
        const cheia = await base44.agents.getConversation(existente.id);
        if (!ativo) return;
        setConversation(cheia);
        setConversationId(cheia.id);
        setMessages(cheia?.messages || []);
      } else {
        const nova = await base44.agents.createConversation({
          agent_name: AGENT,
          metadata: { name: 'Assistente RH', description: 'Conversa do RH com o Assistente IA' },
        });
        if (!ativo) return;
        setConversation(nova);
        setConversationId(nova.id);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [isLoading, me?.role]);

  useEffect(() => {
    if (!conversationId) return undefined;
    const off = base44.agents.subscribeToConversation(conversationId, (data) => {
      const lista = data?.messages || [];
      setMessages(lista);
      const ultima = lista[lista.length - 1];
      if (ultima?.role === 'assistant' && ultima?.content) setBusy(false);
    });
    return () => off();
  }, [conversationId]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (me?.role !== 'admin') {
    return <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">Apenas o RH usa o assistente.</div>;
  }

  async function ask(sugestao) {
    const text = (sugestao ?? question).trim();
    if (!text || busy || !conversation) return;
    stop();
    setQuestion('');
    setBusy(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Não consegui responder agora. Tente de novo.' }]);
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            disabled={busy}
            className="glass h-full rounded-xl p-2.5 text-left text-[11px] leading-snug transition-colors hover:border-primary/40 disabled:opacity-60"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={m.id || i}
            className={`rounded-2xl p-3 text-sm ${m.role === 'user' ? 'ml-8 bg-primary/15' : 'glass mr-8'}`}
          >
            {m.role === 'assistant' ? (
              <div className="flex items-start gap-2">
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none flex-1">
                  {m.content || '…'}
                </ReactMarkdown>
                {m.content ? <SpeakButton text={m.content} /> : null}
              </div>
            ) : (
              m.content
            )}
          </div>
        ))}
        {busy && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="flex gap-2"
      >
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Fale ou digite"
          className="field"
        />
        {supported && (
          <Button
            type="button"
            variant="outline"
            onClick={() => (listening ? stop() : start())}
            title={listening ? 'Parar de ouvir' : 'Falar'}
            aria-label={listening ? 'Parar de ouvir' : 'Falar'}
          >
            <Mic className={listening ? 'h-4 w-4 animate-pulse text-primary' : 'h-4 w-4'} />
          </Button>
        )}
        <Button type="submit" disabled={busy || !question.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}