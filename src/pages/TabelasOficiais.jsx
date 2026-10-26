import { Scale } from 'lucide-react';
import { useMe } from '@/hooks/useMe';
import { useTabelasFiscais } from '@/hooks/useFiscal';
import TabelaFiscalRow from '@/components/admin/TabelaFiscalRow';
import FiscalSyncPanel from '@/components/admin/FiscalSyncPanel';
import FiscalDisclaimer from '@/components/FiscalDisclaimer';

const ehValorFixo = (nome) => String(nome || '').toUpperCase().includes('SALARIO');

export default function TabelasOficiais() {
  const { data: me, isLoading } = useMe();
  const { rows, carregando, salvar, recarregar } = useTabelasFiscais();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white/5" />;
  }

  if (me && me.role !== 'admin') {
    return (
      <div className="glass rounded-xl p-6 text-sm">
        <div className="font-semibold">Área restrita</div>
        <p className="mt-1 text-muted-foreground">Só o administrador do Custo Real vê e edita as tabelas oficiais.</p>
      </div>
    );
  }

  const grupos = rows.reduce((acc, r) => {
    const nome = r.nome_tabela || 'Outros';
    const grupo = acc.find((g) => g.nome === nome);
    if (grupo) grupo.itens.push(r);
    else acc.push({ nome, itens: [r] });
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Scale className="h-6 w-6 text-primary" /> Tabelas Oficiais
        </h1>
        <p className="text-sm text-muted-foreground">
          Configuração fiscal com atualização automática. Todas as contas do app (ficha do colaborador, painel,
          rescisão, relatório do contador e holerite) usam estes valores.
        </p>
      </div>

      <FiscalSyncPanel onAtualizado={recarregar} />

      {carregando ? (
        <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      ) : !rows.length ? (
        <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
          Nenhuma tabela cadastrada — o app está usando os valores de referência da portaria vigente.
        </div>
      ) : (
        grupos.map((g) => (
          <section key={g.nome} className="space-y-2 rounded-xl border border-[#334155] bg-[#1E293B] p-4">
            <h2 className="text-xs font-bold tracking-wider text-[#94A3B8]">{g.nome}</h2>
            {g.itens.map((row) => (
              <TabelaFiscalRow
                key={row.id}
                row={row}
                campo={ehValorFixo(row.nome_tabela) ? 'valor_fixo' : 'porcentagem'}
                onSalvar={salvar}
              />
            ))}
          </section>
        ))
      )}

      <FiscalDisclaimer className="px-1" />
    </div>
  );
}