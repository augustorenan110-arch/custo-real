import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DemoEmployees from '@/components/p/DemoEmployees';
import { toast } from '@/components/ui/use-toast';

const hoje = () => new Date().toISOString().slice(0, 10);

const oitoMesesAtras = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 8);
  return d.toISOString().slice(0, 10);
};

export default function FuncionarioStep({ empresaNome, onCreated }) {
  const [form, setForm] = useState({ nome: '', salario: '2000', admissao: oitoMesesAtras() });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    const salario = Number(form.salario);
    if (!form.nome.trim() || !salario) {
      setErro('Informe o nome e o salário do funcionário.');
      return;
    }
    setSalvando(true);
    try {
      const funcionario = await base44.entities.Employee.create({
        full_name: form.nome.trim(),
        salary: salario,
        admission_date: form.admissao || hoje(),
        active: true,
      });
      onCreated?.(funcionario);
    } catch (err) {
      setErro('Não foi possível salvar o funcionário. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold">Empresa {empresaNome || 'cadastrada'} cadastrada!</h1>
        <p className="mt-1 text-sm text-muted-foreground">Agora cadastre 1 funcionário para calcular o passivo.</p>
      </header>

      <form onSubmit={salvar} id="cadastro-funcionario" className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Passo 2 de 3</p>

        {erro && <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</div>}

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="f-nome-func">Nome do funcionário</Label>
            <Input
              id="f-nome-func"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: João Silva"
              className="field h-12"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-sal">Salário (R$)</Label>
              <Input
                id="f-sal"
                type="number"
                min="500"
                step="50"
                value={form.salario}
                onChange={(e) => setForm({ ...form, salario: e.target.value })}
                className="field h-12"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-adm">Admissão</Label>
              <Input
                id="f-adm"
                type="date"
                value={form.admissao}
                onChange={(e) => setForm({ ...form, admissao: e.target.value })}
                className="field h-12"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-success text-base font-semibold text-success-foreground transition hover:bg-success/90 disabled:opacity-60"
        >
          {salvando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Calculando...
            </>
          ) : (
            <>
              Ver meu passivo <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <DemoEmployees />
    </div>
  );
}