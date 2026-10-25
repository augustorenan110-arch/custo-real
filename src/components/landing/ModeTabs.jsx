import { Building2, Calculator } from 'lucide-react';

const TABS = [
  { id: 'empresa', label: 'SOU EMPRESA', icon: Building2 },
  { id: 'escritorio', label: 'SOU ESCRITÓRIO DE CONTABILIDADE', icon: Calculator },
];

export default function ModeTabs({ tab, onChange }) {
  return (
    <div className="sticky top-0 z-50 bg-[#08080A]/90 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-[600px] gap-1 rounded-xl bg-[#1E293B] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[10px] font-semibold leading-tight transition sm:px-3 sm:text-[13px] ${
              tab === t.id ? 'bg-[#22C55E] font-bold text-black' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <t.icon size={18} strokeWidth={2.2} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}