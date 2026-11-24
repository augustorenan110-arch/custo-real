import { Link } from 'react-router-dom';

const linhas = [
  ['Saldo Salário', 'R$ 3.000,00'],
  ['Aviso Prévio', 'R$ 3.000,00'],
  ['13º Proporcional', 'R$ 2.750,00'],
  ['Férias + 1/3', 'R$ 4.000,00'],
  ['Multa FGTS 40%', 'R$ 1.440,00'],
];

export default function ShowcaseSimulatorMockup({ to }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--landing-depth))] p-3">
      {/* Mockup de celular */}
      <div className="relative h-full max-h-[360px] w-[180px] rounded-[24px] border-2 border-[hsl(var(--primary)/0.4)] bg-black p-1.5 shadow-[0_20px_55px_-30px_hsl(var(--primary)/0.45)]">
        {/* Notch */}
        <div className="absolute left-1/2 top-1.5 z-10 h-3 w-12 -translate-x-1/2 rounded-b-lg bg-black" />
        {/* Tela */}
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-white">
          {/* Status bar */}
          <div className="flex items-center justify-between px-3 pb-1 pt-3 text-[7px] text-gray-400">
            <span>09:41</span>
            <span>●●● 5G</span>
          </div>
          {/* Conteúdo */}
          <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-2.5">
            {/* Header do app */}
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-[#3b82f6] text-[6px] font-bold text-white">CR</div>
              <span className="text-[7px] font-bold text-gray-800">Custo Real RH</span>
            </div>
            {/* Card de simulação */}
            <div className="rounded-lg border border-gray-200 p-2">
              <div className="text-[8px] font-bold text-gray-900">Simulação - RENAN</div>
              <div className="text-[6px] text-gray-500">Contador · R$ 3.000,00 · Sem Justa Causa</div>
              {/* Lista de valores */}
              <div className="mt-1.5 space-y-0.5">
                {linhas.map(([label, valor]) => (
                  <div key={label} className="flex items-center justify-between text-[6.5px] leading-tight">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-mono font-medium text-gray-900">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Total em destaque */}
            <div className="rounded-lg bg-[#1E40AF] px-2 py-1.5 text-center">
              <div className="text-[6px] font-semibold uppercase tracking-wide text-blue-200">Total da Rescisão</div>
              <div className="text-[11px] font-bold text-white">R$ 14.190,00</div>
            </div>
            {/* Botão */}
            <Link to={to} className="mt-auto flex items-center justify-center rounded-lg bg-[#22C55E] py-1.5 text-[7px] font-bold text-white">
              Simular Agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}