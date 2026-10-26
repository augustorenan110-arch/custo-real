import { FileText, Loader2 } from 'lucide-react';

const OPCOES = [
  { key: 'passivo', label: 'Incluir custo real de demissão (passivo oculto)' },
  { key: 'ranking', label: 'Incluir ranking de risco por funcionário' },
  { key: 'ponto', label: 'Incluir irregularidades de ponto' },
];

export default function RelatorioForm({ month, onMonth, incluir, onToggle, onGenerate, gerando }) {
  return (
    <>
      <div
        style={{
          background: '#1E293B',
          borderRadius: '16px',
          padding: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <label
          htmlFor="mes"
          style={{ display: 'block', color: 'white', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}
        >
          Mês de referência
        </label>

        <div
          style={{
            background: '#08080A',
            border: '1px solid #334155',
            borderRadius: '12px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <input
            id="mes"
            type="month"
            value={month}
            onChange={(e) => onMonth(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              colorScheme: 'dark',
            }}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>

        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {OPCOES.map((o) => {
            const marcado = !!incluir[o.key];
            return (
              <label
                key={o.key}
                style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => onToggle(o.key)}
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    flexShrink: 0,
                    background: marcado ? '#22C55E' : '#08080A',
                    border: marcado ? 'none' : '1px solid #334155',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {marcado ? '✓' : ''}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{o.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={gerando}
        onClick={onGenerate}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#007bff] font-black text-white transition-all hover:bg-[#0064d2] disabled:opacity-60"
      >
        {gerando ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
        {gerando ? 'GERANDO...' : 'GERAR PDF CONTÁBIL'}
      </button>
    </>
  );
}