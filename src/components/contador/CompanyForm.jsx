import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { maskCnpj, validaCnpj, maskPhone, cadastrarEmpresaCliente } from '@/lib/contador';
import { useMe } from '@/hooks/useMe';

const VAZIO = { cnpj: '', nome_fantasia: '', whatsapp: '', funcionarios: '1' };

export default function CompanyForm({ open, onOpenChange, referralCode, onSaved }) {
  const { data: me } = useMe();
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validaCnpj(form.cnpj)) {
      setErro('CNPJ inválido — confira os 14 dígitos.');
      return;
    }
    const funcionarios = Number(form.funcionarios);
    if (!funcionarios || funcionarios < 1 || funcionarios > 100) {
      setErro('Informe de 1 a 100 funcionários.');
      return;
    }
    setSalvando(true);
    try {
      const { link } = await cadastrarEmpresaCliente({ me, referralCode, form });
      toast({
        title: 'Empresa cadastrada!',
        description: `Link de ativação: ${link}`,
      });
      setForm(VAZIO);
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      setErro('Não foi possível cadastrar a empresa. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar empresa cliente</DialogTitle>
          <DialogDescription>
            Trial de 7 dias em R$ 59,90/mês. Você recebe R$ 17,97/mês quando ela ativar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={salvar} className="space-y-4">
          {erro && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="f-cnpj">CNPJ</Label>
            <Input
              id="f-cnpj"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: maskCnpj(e.target.value) })}
              placeholder="00.000.000/0000-00"
              className="field h-12"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="f-nome">Nome fantasia</Label>
            <Input
              id="f-nome"
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              placeholder="Ex: Mercado Bom Preço"
              className="field h-12"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-zap">WhatsApp do dono (com DDD)</Label>
              <Input
                id="f-zap"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: maskPhone(e.target.value) })}
                placeholder="(11) 99999-9999"
                className="field h-12"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-func">Qtd funcionários</Label>
              <Input
                id="f-func"
                type="number"
                min="1"
                max="100"
                value={form.funcionarios}
                onChange={(e) => setForm({ ...form, funcionarios: e.target.value })}
                className="field h-12"
                required
              />
            </div>
          </div>

          <Button type="submit" className="h-12 w-full font-semibold" disabled={salvando}>
            {salvando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cadastrando...
              </>
            ) : (
              'Cadastrar e gerar link do cliente'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}