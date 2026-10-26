import { Clock } from 'lucide-react';
import { useMeuFuncionario } from '@/hooks/useMeuFuncionario';
import { useTimeEntries } from '@/hooks/useHr';
import PontoFacial from '@/components/funcionario/PontoFacial';

const hoje = () => new Date().toISOString().slice(0, 10);
const mesAtual = () => new Date().toISOString().slice(0, 7);
const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR').slice(0, 5);

export default function MeuInicio() {
  const { me, funcionario } = useMeuFuncionario();
  const { data: entries = [] } = useTimeEntries(funcionario?.id, mesAtual());

  const primeiroNome = (funcionario?.full_name || me?.full_name || '').split(' ')[0] || 'colaborador';
  const batidas = entries.filter((e) => e.day === hoje());

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Olá,</p>
        <h1 className="text-2xl font-semibold">{primeiroNome}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {batidas.length
            ? batidas
                .map((b) => `${b.kind === 'entrada' ? 'Entrada' : 'Saída'} ${hora(b.punched_at)}`)
                .join(' · ')
            : 'Nenhuma batida hoje'}
        </p>
      </div>

      {funcionario && <PontoFacial funcionario={funcionario} me={me} />}
    </div>
  );
}