import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LockedCard from '@/components/p/LockedCard';
import { maskCnpj, validaCnpj } from '@/lib/contador';
import { toast } from '@/components/ui/use-toast';

const BLOQUEADOS = [
  { titulo: 'Ponto facial com prova de vida', nota: 'Bloqueado - cadastre empresa' },
  { titulo: 'Ranking de custo real', nota: 'Bloqueado - cadastre empresa' },
  { titulo: 'Simulador de rescisão R$ 5.838', nota: 'Bloqueado - cadastre empresa' },
];

export default function EmpresaStep({ nome, onCreated }) {
  const [form, setForm] = useState({ cnpj: '', nome_fantasia: '', funcionarios: '1' });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validaCnpj(form.cnpj)) {
      setErro('CNPJ inválido — confira os 14 dígitos.');
      return;
    }
    setSalvando(true);
    try {
      const empresa = await base44.entities.Company.create({
        name: form.nome_fantasia,
        cnpj: form.cnpj,
        employee_count: Number(form.funcionarios) || 0,
        status_assinatura: 'trialing',
        plano_atual: 'trial_premium',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        data_cadastro: new Date().toISOString().slice(0, 10),
        limite_funcionarios: 3,
      });
      toast({ title: 'Empresa cadastrada!', description: `Agora cadastre o primeiro funcionário de ${empresa.name}.` });
      onCreated?.(empresa);
    } catch (err) {
      setErro('Não foi possível cadastrar a empresa. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold">Olá, {nome || 'chefe'}! Vamos calcular seu passivo real em 30 segundos.</h1>
      </header>

      <form onSubmit={salvar} className="cta-blue rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Passo 1 de 3</p>
        <h2 className="mt-1 font-display text-lg font-bold text-white">Cadastre sua primeira empresa</h2>

        {erro && <div className="mt-3 rounded-lg bg-black/25 p-3 text-sm text-white">{erro}</div>}

        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="o-cnpj" className="text-xs text-white/85">CNPJ</Label>
            <Input
              id="o-cnpj"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: maskCnpj(e.target.value) })}
              placeholder="00.000.000/0000-00"
              className="h-12 border-white/25 bg-white/95 text-slate-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-nome" className="text-xs text-white/85">Nome fantasia</Label>
            <Input
              id="o-nome"
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              placeholder="Ex: Mercado Bom Preço"
              className="h-12 border-white/25 bg-white/95 text-slate-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="o-func" className="text-xs text-white/85">Quantos funcionários?</Label>
            <Input
              id="o-func"
              type="number"
              min="1"
              max="100"
              value={form.funcionarios}
              onChange={(e) => setForm({ ...form, funcionarios: e.target.value })}
              className="h-12 border-white/25 bg-white/95 text-slate-900"
              required
            />
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
              Calcular meu passivo agora <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="space-y-2">
        {BLOQUEADOS.map((b) => (
          <LockedCard key={b.titulo} titulo={b.titulo} nota={b.nota} />
        ))}
      </div>
    </div>
  );
}