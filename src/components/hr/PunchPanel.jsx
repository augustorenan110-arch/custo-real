import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CameraCapture from '@/components/hr/CameraCapture';
import { getPosition, reverseGeocode, mapsUrl } from '@/lib/geo';

const KIND_LABEL = {
  entrada: 'Entrada',
  intervalo_inicio: 'Início do intervalo',
  intervalo_fim: 'Fim do intervalo',
  saida: 'Saída',
};

export default function PunchPanel({ employee, defaultKind = 'entrada' }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [kind, setKind] = useState(defaultKind);
  const [preview, setPreview] = useState(null);
  const queryClient = useQueryClient();

  // Pré-busca de localização + endereço para mostrar "Você está em: ..." antes da selfie.
  useEffect(() => {
    let active = true;
    setPreview({ loading: true });
    getPosition().then(async (pos) => {
      if (!active) return;
      if (!pos) { setPreview(null); return; }
      const addr = await reverseGeocode(pos.lat, pos.lng);
      if (!active) return;
      setPreview({
        loading: false,
        endereco: addr?.endereco || '',
        accuracy: pos.accuracy,
        lat: pos.lat,
        lng: pos.lng,
        lowGps: pos.accuracy > 50,
      });
    });
    return () => { active = false; };
  }, []);

  async function punch(file) {
    setBusy(true);
    setResult(null);
    try {
      const [{ file_uri }, pos] = await Promise.all([
        base44.integrations.Core.UploadPrivateFile({ file }),
        getPosition(),
      ]);
      const lat = pos?.lat ?? null;
      const lng = pos?.lng ?? null;
      const accuracy = pos?.accuracy ?? null;
      const { data } = await base44.functions.invoke('punchClock', {
        employee_id: employee.id,
        selfie_uri: file_uri,
        lat,
        lng,
        kind,
        accuracy,
      });
      setResult({
        ...data,
        hasLocation: !!pos,
        lat,
        lng,
        accuracy,
        rua: data?.rua || '—',
        bairro: data?.bairro || '—',
        cidade_uf: data?.cidade_uf || '—',
        endereco: data?.endereco || '',
      });
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
        Conferindo o rosto… Buscando endereço…
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
        </div>

        {ok && result.hasLocation && result.lat != null && (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-left">
            <p className="flex items-center gap-2 text-sm font-bold text-success">
              <MapPin className="h-4 w-4" /> Localização registrada
            </p>
            <dl className="mt-2 space-y-1 break-words text-xs text-foreground/80">
              <div>
                <span className="text-muted-foreground">Rua: </span>
                {result.rua || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">Bairro - Cidade/UF: </span>
                {[result.bairro, result.cidade_uf].filter(Boolean).join(' - ') || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">Precisão: </span>
                {result.accuracy != null ? `${result.accuracy} metros` : '—'}
              </div>
            </dl>
            {result.accuracy != null && result.accuracy > 50 && (
              <p className="mt-2 text-xs font-semibold text-warning">⚠ Ligue o GPS para localização exata</p>
            )}
            <a
              href={mapsUrl(result.lat, result.lng)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" /> Ver no Mapa
            </a>
          </div>
        )}

        {ok && !result.hasLocation && (
          <p className="text-xs text-warning">Localização não autorizada — ponto sem local.</p>
        )}

        <button onClick={() => setResult(null)} className="text-sm text-primary hover:underline">
          {ok ? 'Concluir' : 'Tentar de novo'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {preview && (
        <div className="rounded-2xl border border-border bg-white/5 p-3 text-left">
          <p className="flex items-center gap-2 text-xs font-semibold">
            <MapPin className="h-4 w-4 text-primary" /> Você está em:
          </p>
          {preview.loading ? (
            <p className="mt-1 text-xs text-muted-foreground">Buscando endereço...</p>
          ) : (
            <p className="mt-1 break-words text-xs text-foreground/80">{preview.endereco || '—'}</p>
          )}
          {preview.accuracy != null && (
            <p className="mt-1 text-xs text-muted-foreground">Precisão: {preview.accuracy}m</p>
          )}
          {preview.lowGps && (
            <p className="mt-1 text-xs font-medium text-warning">⚠ Ligue o GPS para localização exata</p>
          )}
        </div>
      )}
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