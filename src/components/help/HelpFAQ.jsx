import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export const FAQ_ITEMS = [
  {
    q: 'Como cadastrar minha empresa?',
    a: 'Clique em Criar Conta, preencha o nome da empresa, CNPJ, e-mail e senha. Você já entra como Administrador e pode começar a cadastrar sua equipe.',
  },
  {
    q: 'Como cadastrar um funcionário?',
    a: 'Dentro do app, vá em Funcionários > + Cadastrar Funcionário. Preencha nome, CPF, cargo, salário e data de admissão. Ele vai aparecer só na sua empresa.',
  },
  {
    q: 'Como funciona o teste de 7 dias?',
    a: 'Você tem 7 dias grátis para testar tudo, sem precisar de cartão. Depois dos 7 dias, é só assinar um plano para continuar usando.',
  },
  {
    q: 'Como funciona o desconto por atraso?',
    a: 'A tolerância é de 5 minutos por marcação. Se passar disso, o sistema desconta só os minutos que excederam a tolerância, de forma proporcional ao salário, conforme a CLT.',
  },
  {
    q: 'Como funciona o desconto por falta?',
    a: 'Falta sem justificar desconta 1 dia de salário + o DSR (descanso semanal). Falta com atestado não tem desconto.',
  },
  {
    q: 'Minha empresa vê dados de outra empresa?',
    a: 'Não. Cada empresa tem seus dados separados e seguros. Você só vê os funcionários e informações da sua empresa.',
  },
  {
    q: 'Como cadastrar a carga horária?',
    a: 'Vá em Configurações > Carga Horária. Defina a entrada, saída, horário de almoço e os dias de trabalho. O sistema faz o cálculo dos descontos sozinho.',
  },
  {
    q: 'Como cancelar?',
    a: 'Chama a gente no WhatsApp (18) 99704-6427 ou no e-mail rhcustoreal@gmail.com que a gente cancela pra você.',
  },
  {
    q: 'Esqueci minha senha, o que faço?',
    a: 'Na tela de login, clique em Esqueci minha senha. Você vai receber um link no seu e-mail para criar uma nova senha.',
  },
  {
    q: 'Não consigo entrar, o que faço?',
    a: 'Verifique se o e-mail e a senha estão corretos. Se o erro continuar, fale com a gente pelos contatos no rodapé do site que a gente resolve pra você.',
  },
];

export default function HelpFAQ() {
  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} value={`q${i}`}>
            <AccordionTrigger className="text-sm font-medium text-foreground">
              {item.q}
            </AccordionTrigger>
            <AccordionContent>
              <p className="leading-relaxed text-muted-foreground">{item.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Não achou sua dúvida? Veja nossos contatos no rodapé do site.
      </p>
    </div>
  );
}