import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ScanFace } from 'lucide-react';
import PunchPanel from '@/components/hr/PunchPanel';
import ConsentDialog from '@/components/hr/ConsentDialog';

/**
 * Botão gigante de ponto facial do funcionário. Só libera a câmera depois do
 * consentimento de biometria (LGPD) — o mesmo usado na tela antiga de ponto.
 */
export default function PontoFacial({ funcionario, me }) {
  const [autorizado, setAutorizado] = useState(null);
  const [recusou, setRecusou] = useState(false);
  const consentimento = autorizado ?? me?.consentimento_biometria === true;

  if (!funcionario.face_ref_uri) {
    return (
      <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
        O RH ainda não cadastrou o seu rosto. Peça para usarem “Cadastrar rosto” na sua ficha.
      </div>
    );
  }

  if (recusou) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="flex items-center gap-2 text-sm font-medium">
          <ShieldAlert className="h-4 w-4 text-warning" /> Ponto facial bloqueado sem autorização de biometria
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Você optou por não autorizar o uso da foto facial e da localização. Peça ao RH para registrar o ponto por
          outro meio — ou autorize depois em Configurações → Privacidade e Dados.
        </p>
        <Link to="/privacidade" className="mt-2 inline-block text-xs text-primary hover:underline">
          Ver como tratamos seus dados
        </Link>
      </div>
    );
  }

  if (consentimento) {
    return (
      <div className="glass rounded-2xl p-5">
        <PunchPanel key={funcionario.id} employee={funcionario} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="cta-green flex w-full flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center transition active:scale-[0.99]"
      >
        <ScanFace className="h-16 w-16" strokeWidth={1.6} />
        <span className="font-display text-xl font-extrabold sm:text-2xl">BATER PONTO FACIAL</span>
        <span className="text-xs font-medium opacity-80">Tire uma selfie: a IA confere o seu rosto na hora</span>
      </button>
      <ConsentDialog
        open
        forceOpen
        onAuthorized={() => setAutorizado(true)}
        onRefused={() => setRecusou(true)}
      />
    </>
  );
}