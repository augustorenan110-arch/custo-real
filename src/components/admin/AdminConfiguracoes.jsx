import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const DEFAULTS = {
  preco_starter_mensal: '29.90',
  preco_starter_anual: '297.00',
  preco_premium_mensal: '59.90',
  preco_premium_anual: '597.00',
  whatsapp_suporte: '',
  texto_hero_titulo: 'O controle da sua empresa na palma da sua mão',
  texto_hero_subtitulo: 'Gestão de Pessoas e Custos com Inteligência Artificial',
};

const LABELS = {
  preco_starter_mensal: 'Preço STARTER mensal (R$)',
  preco_starter_anual: 'Preço STARTER anual (R$)',
  preco_premium_mensal: 'Preço PREMIUM mensal (R$)',
  preco_premium_anual: 'Preço PREMIUM anual (R$)',
  whatsapp_suporte: 'WhatsApp de suporte',
  texto_hero_titulo: 'Título do Hero (Landing Page)',
  texto_hero_subtitulo: 'Subtítulo do Hero (Landing Page)',
};

export default function AdminConfiguracoes() {
  const qc = useQueryClient();
  const { data: settings = [] } = useQuery({
    queryKey: ['admin', 'app-settings'],
    queryFn: async () => {
      const r = await base44.entities.AppSetting.filter({}, { limit: 100 });
      return r.items;
    },
  });

  const [values, setValues] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings.length) return;
    const map = { ...DEFAULTS };
    settings.forEach((s) => { if (s.chave in DEFAULTS) map[s.chave] = s.valor; });
    setValues(map);
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      const existing = {};
      settings.forEach((s) => { existing[s.chave] = s.id; });
      await Promise.all(
        Object.entries(values).map(async ([chave, valor]) => {
          if (existing[chave]) {
            await base44.entities.AppSetting.update(existing[chave], { valor });
          } else {
            await base44.entities.AppSetting.create({ chave, valor });
          }
        })
      );
      qc.invalidateQueries({ queryKey: ['admin', 'app-settings'] });
      alert('Configurações salvas com sucesso!');
    } catch (e) {
      alert('Erro ao salvar: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold">Configurações</h2>
      <p className="mt-1 text-sm text-muted-foreground">Edite preços e textos do app.</p>

      <div className="glass mt-6 space-y-4 rounded-2xl p-5">
        {Object.entries(LABELS).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <Input
              value={values[key] || ''}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              className="field h-10"
            />
          </div>
        ))}
        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}