import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { brl, dateBR } from '@/lib/format';

const semTeto = (v) => !v || Number(v) >= 99999999;

/** Uma linha da tabela oficial, com a porcentagem (ou o valor fixo) editável. */
export default function TabelaFiscalRow({ row, campo, onSalvar }) {
  const [valor, setValor] = useState(row[campo] ?? 0);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');

  const alterado = Number(valor) !== Number(row[campo] ?? 0);

  const salvar = async () => {
    setSalvando(true);
    setErro('');
    try {
      await onSalvar(row.id, campo === 'valor_fixo' ? { valor_fixo: Number(valor) } : { porcentagem: Number(valor) });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch (e) {
      setErro(e?.message || 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0F172A] p-3">
      <div className="min-w-0">
        <div className="text-xs font-bold text-white">
          {row.nome_tabela} · faixa {row.faixa_de ? brl(row.faixa_de) : 'R$ 0,00'} até{' '}
          {semTeto(row.faixa_ate) ? 'acima' : brl(row.faixa_ate)}
        </div>
        <div className="text-[10px] text-[#22C55E]">Vigente desde {dateBR(row.data_vigencia) || '—'}</div>
        {row.fonte_oficial && <div className="truncate text-[10px] text-[#64748b]">{row.fonte_oficial}</div>}
        {erro && <div className="text-[10px] text-[#f87171]">{erro}</div>}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="h-11 w-24 border-[#334155] bg-[#1E293B] text-white"
        />
        <span className="text-xs text-[#94A3B8]">{campo === 'valor_fixo' ? 'R$' : '%'}</span>
        <Button size="sm" variant="secondary" onClick={salvar} disabled={salvando || !alterado} className="h-11">
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : salvo ? <Check className="h-4 w-4 text-[#22C55E]" /> : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}