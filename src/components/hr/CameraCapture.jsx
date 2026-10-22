import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Abre a câmera frontal e devolve um File JPEG da selfie via onCapture.
export default function CameraCapture({ onCapture, disabled, label = 'Tirar selfie' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  async function start() {
    setError('');
    setReady(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este dispositivo não suporta câmera no navegador.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch (e) {
      setError(
        e?.name === 'NotAllowedError'
          ? 'Permissão da câmera negada. Libere o acesso à câmera nas configurações do navegador/aparelho e tente de novo.'
          : 'Não foi possível abrir a câmera.',
      );
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    start();
    return stop;
  }, []);

  function snap() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const size = Math.min(v.videoWidth, v.videoHeight);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, 640, 640);
    canvas.toBlob(
      (blob) => blob && onCapture(new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' })),
      'image/jpeg',
      0.85,
    );
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
        <div className="flex items-start gap-2">
          <CameraOff className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={start}>
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-primary/30 bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-dashed border-white/40" />
      </div>
      <Button className="w-full" onClick={snap} disabled={!ready || disabled}>
        <Camera className="h-4 w-4" /> {label}
      </Button>
    </div>
  );
}