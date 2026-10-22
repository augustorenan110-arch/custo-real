import { useExpenses } from '@/hooks/useExpenses';
import NewExpenseForm from '@/components/NewExpenseForm';
import ExpenseCard from '@/components/ExpenseCard';

export default function Expenses() {
  const { data: list = [], isLoading } = useExpenses();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Despesas</h1>
        <p className="text-sm text-muted-foreground">Envie recibos e acompanhe seus reembolsos.</p>
      </header>

      <NewExpenseForm />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Minhas despesas</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && list.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma despesa enviada ainda.</p>
        )}
        {list.map((e) => (
          <ExpenseCard key={e.id} expense={e} />
        ))}
      </section>
    </div>
  );
}