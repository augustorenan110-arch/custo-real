import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CameraCapture from '@/components/hr/CameraCapture';

const KIND_LABEL = {
  entrada: 'Entrada',
  intervalo_inicio: 'Início do intervalo',
  intervalo_fim: 'Fim do intervalo',
  saida: 'Saída',
};

const getPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });

export default function PunchPanel({ employee, defaultKind = 'entrada' }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [kind, setKind] = useState(defaultKind);
  const queryClient = useQueryClient();

  async function punch(file) {
    setBusy(true);
    setResult(null);
    try {
      const [{ file_uri }, pos] = await Promise.all([
        base44.integrations.Core.UploadPrivateFile({ file }),
        getPosition(),
      ]);
      const { data } = await base44.functions.invoke('punchClock', {
        employee_id: employee.id,
        selfie_uri: file_uri,
        lat: pos?.lat,
        lng: pos?.lng,
        kind,
      });
      setResult({ ...data, hasLocation: !!pos });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    } catch (e) {
      setResult({ accepted: false, reason: e?.response?.data?.error || 'Não foi possível registrar o ponto.' });
    } finally {
      setBusy(false);
    }
  }

  if (busy) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        Conferindo o rosto…
      </div>
    );
  }

  if (result) {
    const ok = result.accepted;
    return (
      <div className="space-y-4 text-center">
        {ok ? <CheckCircle2 className="mx-auto h-14 w-14 text-success" /> : <XCircle className="mx-auto h-14 w-14 text-destructive" />}
        <div>
          <p className="font-display text-xl font-semibold">
            {ok ? `${KIND_LABEL[result.kind] || result.kind} registrada` : 'Ponto não registrado'}
          </p>
          {ok && (
            <p className="text-sm text-muted-foreground">
              {new Date(result.punched_at).toLocaleTimeString('pt-BR')} · confiança {result.confidence}%
            </p>
          )}
          {result.reason && <p className="mt-1 text-xs text-muted-foreground">{result.reason}</p>}
          {ok && result.unit && (
            <p className="mt-1 flex items-center justify-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {result.unit}
              {result.inside_unit === false && <span className="text-warning"> · fora do raio da unidade</span>}
            </p>
          )}
          {ok && !result.hasLocation && (
            <p className="mt-1 text-xs text-warning">Localização não autorizada — ponto sem local.</p>
          )}
        </div>
        <button onClick={() => setResult(null)} className="text-sm text-primary hover:underline">
          {ok ? 'Concluir' : 'Tentar de novo'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {['entrada', 'intervalo_inicio', 'intervalo_fim', 'saida'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
              kind === k
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-white/10 bg-white/5 text-foreground/70 hover:text-foreground'
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <CameraCapture onCapture={punch} label={`Tirar selfie e registrar ${KIND_LABEL[kind].toLowerCase()}`} />
    </div>
  );
}