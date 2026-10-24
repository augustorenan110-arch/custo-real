import { Link } from 'react-router-dom';
import { Mail, Settings, Trash2, Clock } from 'lucide-react';
import LegalPage from '@/components/legal/LegalPage';

const steps = [
  {
    icon: Settings,
    title: 'Pelo aplicativo (imediato)',
    body: 'Entre com a sua conta, abra Configurações → Privacidade e Dados e toque em "Excluir minha conta e biometria facial". Digite EXCLUIR para confirmar.',
  },
  {
    icon: Mail,
    title: 'Por e-mail (até 48 horas)',
    body: 'Envie a solicitação para dpo@custoreal.com.br com o assunto "Exclusão de dados", informando nome completo, CPF e a empresa em que trabalha.',
  },
  {
    icon: Trash2,
    title: 'O que é apagado',
    body: 'Conta de acesso, foto facial de referência, selfies de batida, registros de ponto, dados de geolocalização das batidas, recibos e despesas, consentimentos e histórico pessoal.',
  },
  {
    icon: Clock,
    title: 'Prazo e exceções',
    body: 'A exclusão é executada em até 48 horas após a confirmação. Registros que a lei obriga a manter (obrigações trabalhistas, previdenciárias e fiscais, CLT art. 74 e LGPD art. 16) podem ser conservados pelo prazo legal de 5 anos, de forma restrita e auditada.',
  },
];

const faq = [
  {
    title: 'Perco o direito aos meus horários já registrados?',
    body: 'Não. Espelhos de ponto e comprovantes podem ser solicitados por e-mail antes da exclusão, ou exportados pelo RH da sua empresa.',
  },
  {
    title: 'A empresa continua vendo meus dados após a exclusão?',
    body: 'A conta e a biometria são eliminadas. O que a empresa precisa manter por obrigação legal permanece bloqueado para o Custo Real, acessível apenas ao RH autorizado.',
  },
  {
    title: 'Posso usar o ponto sem biometria?',
    body: 'Sim. Ao recusar a autorização de biometria, o ponto facial fica bloqueado e o RH registra o ponto por outro meio, registrando o motivo em auditoria.',
  },
];

export default function DeleteData() {
  return (
    <LegalPage
      title="Excluir minha conta e meus dados"
      updated="Procedimento de exclusão de dados — LGPD, art. 18 · resposta em até 48 horas"
      sections={faq}
    >
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.title} className="glass rounded-2xl p-4">
            <s.icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
            <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-4 rounded-2xl p-5 text-sm leading-relaxed text-foreground/75">
        <p className="font-semibold text-foreground">Resumo do pedido</p>
        <p className="mt-1">
          E-mail: <span className="text-primary">dpo@custoreal.com.br</span> · Assunto: Exclusão de dados ·
          Prazo de atendimento: até 48 horas · Encarregado de Dados (DPO): Custo Real.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
          <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
        </p>
      </div>
    </LegalPage>
  );
}