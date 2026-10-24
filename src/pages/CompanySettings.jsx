import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Trash2, Loader2, LocateFixed } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMe } from '@/hooks/useMe';
import { useCompany } from '@/hooks/useHr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import PrivacyDataSection from '@/components/account/PrivacyDataSection';

const ACTIVITIES = ['Comércio', 'Serviços', 'Indústria', 'Tecnologia', 'Saúde', 'Construção'];

const maskCnpj = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export default function CompanySettings() {
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: company, isLoading } = useCompany();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', cnpj: '', activity: '', min_confidence: 80, workday_hours: 8, units: [] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (company) setForm({ units: [], min_confidence: 80, workday_hours: 8, ...company });
  }, [company]);

  if (loadingMe || isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  const isAdmin = me?.role === 'admin';

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setUnit = (i, k, v) => set('units', form.units.map((u, j) => (j === i ? { ...u, [k]: v } : u)));
  const addUnit = () => set('units', [...form.units, { name: '', lat: 0, lng: 0, radius_m: 150 }]);
  const fillCurrentLocation = (i) =>
    navigator.geolocation?.getCurrentPosition(
      (p) => set('units', form.units.map((u, j) => (j === i ? { ...u, lat: p.coords.latitude, lng: p.coords.longitude } : u))),
      () => toast({ variant: 'destructive', title: 'Localização não autorizada' }),
    );

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast({ variant: 'destructive', title: 'Informe o nome da empresa' });
    setBusy(true);
    try {
      const data = {
        name: form.name.trim(),
        cnpj: form.cnpj,
        activity: form.activity,
        min_confidence: Number(form.min_confidence) || 80,
        workday_hours: Number(form.workday_hours) || 8,
        units: form.units.filter((u) => u.name.trim()).map((u) => ({
          name: u.name.trim(), lat: Number(u.lat), lng: Number(u.lng), radius_m: Number(u.radius_m) || 150,
        })),
      };
      if (company?.id) await base44.entities.Company.update(company.id, data);
      else await base44.entities.Company.create(data);
      await queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({ title: 'Empresa salva' });
    } catch {
      toast({ variant: 'destructive', title: 'Não foi possível salvar' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        <Building2 className="h-6 w-6 text-primary" /> Configurações
      </h1>

      {!isAdmin && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          Apenas o RH edita os dados da empresa. Suas preferências de privacidade estão logo abaixo.
        </div>
      )}

      {isAdmin && (
        <form onSubmit={save} className="space-y-5">
          <div className="glass space-y-3 rounded-2xl p-5">
            <div className="space-y-1.5">
              <Label htmlFor="n">Nome da empresa</Label>
              <Input id="n" value={form.name} onChange={(e) => set('name', e.target.value)} className="field" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c">CNPJ</Label>
              <Input id="c" value={form.cnpj || ''} onChange={(e) => set('cnpj', maskCnpj(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" className="field" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a">Atividade</Label>
              <Input id="a" value={form.activity || ''} onChange={(e) => set('activity', e.target.value)} className="field" />
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITIES.map((a) => (
                  <button type="button" key={a} onClick={() => set('activity', a)} className="rounded-full border border-white/15 px-2.5 py-1 text-xs hover:border-primary/50">
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mc">Confiança mínima do rosto (%)</Label>
                <Input id="mc" type="number" min="50" max="100" value={form.min_confidence} onChange={(e) => set('min_confidence', e.target.value)} className="field" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wh">Jornada diária (h)</Label>
                <Input id="wh" type="number" min="1" max="12" value={form.workday_hours} onChange={(e) => set('workday_hours', e.target.value)} className="field" />
              </div>
            </div>
          </div>

          <div className="glass space-y-3 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Unidades (local do ponto)</h2>
              <Button type="button" variant="outline" size="sm" onClick={addUnit}>
                <Plus className="h-4 w-4" /> Unidade
              </Button>
            </div>
            {form.units.length === 0 && <p className="text-xs text-muted-foreground">Sem unidades: o ponto é aceito sem checar o local.</p>}
            {form.units.map((u, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-white/10 p-3">
                <div className="flex gap-2">
                  <Input placeholder="Nome da unidade" value={u.name} onChange={(e) => setUnit(i, 'name', e.target.value)} className="field" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => set('units', form.units.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" step="any" placeholder="Latitude" value={u.lat} onChange={(e) => setUnit(i, 'lat', e.target.value)} className="field" />
                  <Input type="number" step="any" placeholder="Longitude" value={u.lng} onChange={(e) => setUnit(i, 'lng', e.target.value)} className="field" />
                  <Input type="number" placeholder="Raio (m)" value={u.radius_m} onChange={(e) => setUnit(i, 'radius_m', e.target.value)} className="field" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => fillCurrentLocation(i)}>
                  <LocateFixed className="h-4 w-4" /> Usar minha localização atual
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
          </Button>
        </form>
      )}

      <PrivacyDataSection />
    </div>
  );
}