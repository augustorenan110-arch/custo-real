import { useEffect, useState } from 'react';
import { Clock, ShieldAlert, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';
import { useEmployees } from '@/hooks/useHr';
import PunchPanel from '@/components/hr/PunchPanel';
import ConsentDialog from '@/components/hr/ConsentDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { requestGeoPermission } from '@/lib/geo';

export default function Punch() {
  const { data: me } = useMe();
  const { data: employees = [], isLoading } = useEmployees();
  const [pickedId, setPickedId] = useState('');
  const [granted, setGranted] = useState(null);
  const [refused, setRefused] = useState(false);
  const [geo, setGeo] = useState(null);

  // Ao abrir a tela de ponto, pede permissão de localização do navegador/celular.
  useEffect(() => {
    let active = true;
    requestGeoPermission().then((s) => active && setGeo(s));
    return () => {
      active = false;
    };
  }, []);

  const isAdmin = me?.role === 'admin';
  const active = employees.filter((e) => e.active !== false);
  const mine = active.find((e) => (e.email || '').toLowerCase() === (me?.email || '').toLowerCase());
  const employee = isAdmin ? active.find((e) => e.id === pickedId) : mine;

  const consent = granted ?? me?.consentimento_biometria === true;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Clock className="h-6 w-6 text-primary" /> Ponto facial
        </h1>
        <p className="text-sm text-muted-foreground">
          Tire uma selfie. A IA compara com a sua foto de referência e registra entrada ou saída.
        </p>
      </div>

      {geo === 'denied' && (
        <div className="glass flex items-start gap-3 rounded-2xl border border-warning/40 p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm text-foreground/80">
            Ative a localização para registrar o ponto com prova. No celular, autorize o acesso à localização nas
            permissões do navegador.
          </p>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {isAdmin && (
        <Select value={pickedId} onValueChange={setPickedId}>
          <SelectTrigger className="field">
            <SelectValue placeholder="Escolha o colaborador" />
          </SelectTrigger>
          <SelectContent>
            {active.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isLoading && !employee && !isAdmin && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          Nenhuma ficha de colaborador está vinculada ao seu e-mail ({me?.email}). Peça ao RH para cadastrar você.
        </div>
      )}

      {employee && !employee.face_ref_uri && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          {employee.full_name} ainda não tem rosto cadastrado. O RH precisa usar "Cadastrar rosto" na ficha.
        </div>
      )}

      {employee?.face_ref_uri && refused && (
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-warning" /> Ponto facial bloqueado sem a autorização de biometria
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Você escolheu não autorizar o uso da foto facial e da localização. O RH deve registrar o ponto por
            outro meio. Você pode autorizar depois em Configurações → Privacidade e Dados.
          </p>
          <Link to="/privacidade" className="mt-2 inline-block text-xs text-primary hover:underline">
            Ver como tratamos seus dados
          </Link>
        </div>
      )}

      {employee?.face_ref_uri && !consent && !refused && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          Autorize a biometria na janela abaixo para liberar a câmera e bater o ponto.
        </div>
      )}

      {employee?.face_ref_uri && consent && (
        <div className="glass rounded-2xl p-5">
          <PunchPanel key={employee.id} employee={employee} />
        </div>
      )}

      {employee?.face_ref_uri && !consent && !refused && (
        <ConsentDialog
          open
          forceOpen
          onAuthorized={() => setGranted(true)}
          onRefused={() => setRefused(true)}
        />
      )}
    </div>
  );
}