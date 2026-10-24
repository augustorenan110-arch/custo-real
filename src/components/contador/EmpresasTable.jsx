import { Link } from 'react-router-dom';
import { Copy, Link2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { brl, dateBR } from '@/lib/format';
import { statusAssinaturaLabel, PLANO_CLIENTE } from '@/lib/contador';

export default function EmpresasTable({ assinaturas = [] }) {
  const copiar = (link) => {
    const url = `${window.location.origin}${link}`;
    navigator.clipboard?.writeText(url);
    toast({ title: 'Link copiado', description: url });
  };

  if (!assinaturas.length) {
    return (
      <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
        Nenhuma empresa cadastrada ainda. Use o botão verde acima para cadastrar a primeira.
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">CNPJ</th>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-right">Sua comissão</th>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {assinaturas.map((s) => {
              const status = statusAssinaturaLabel(s.status);
              const link = `/ativar/${s.company_id}`;
              return (
                <tr key={s.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 tabular-nums text-foreground/80">{s.cnpj}</td>
                  <td className="px-4 py-3">{s.company_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.tone}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{brl(s.amount || PLANO_CLIENTE.valor)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-save-tech">
                    {brl(s.commission_to_accountant ?? PLANO_CLIENTE.comissao)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dateBR(s.created_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={link}
                        className="inline-flex items-center gap-1 text-xs text-primary transition hover:underline"
                      >
                        <Link2 className="h-3.5 w-3.5" /> Ver link
                      </Link>
                      <button
                        type="button"
                        onClick={() => copiar(link)}
                        aria-label="Copiar link"
                        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}