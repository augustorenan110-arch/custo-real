import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CameraCapture from '@/components/hr/CameraCapture';

const getPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });

export default function PunchPanel({ employee }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
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
            {ok ? `${result.kind === 'entrada' ? 'Entrada' : 'Saída'} registrada` : 'Ponto não registrado'}
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

  return <CameraCapture onCapture={punch} label="Tirar selfie e bater ponto" />;
}