import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = [
  {
    q: 'Precisa de aparelho de ponto?',
    a: 'Não. Só o celular do funcionário. A batida é feita por reconhecimento facial com prova de vida, sem catraca e sem relógio de ponto.',
  },
  {
    q: 'Funciona se o funcionário não tiver internet?',
    a: 'Sim. A batida fica gravada no aparelho e sincroniza automaticamente quando a conexão volta.',
  },
  {
    q: 'É válido juridicamente?',
    a: 'Sim. O registro usa prova de vida, data, hora, unidade e geolocalização, seguindo a CLT (art. 74) e a Portaria MTP 671/2021. Todo ajuste manual fica gravado em auditoria com o motivo.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, em 1 clique, direto em Planos. O acesso continua até o fim do período já pago e seus dados podem ser exportados.',
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="lazy-section mx-auto max-w-3xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-20">
      <h2 className="font-tech text-center text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>
      <Accordion type="single" collapsible className="mt-8 space-y-3">
        {FAQ.map((item, i) => (
          <AccordionItem
            key={item.q}
            value={`item-${i}`}
            className="tech-card rounded-2xl border-b-0 px-5"
          >
            <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-foreground/65">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}