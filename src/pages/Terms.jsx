import LegalPage from '@/components/legal/LegalPage';

const sections = [
  {
    title: '1. Objeto e aceitação',
    body: 'Estes Termos regulam o uso da plataforma Custo Real, software de gestão de pessoas, ponto eletrônico facial, folha, despesas e custos trabalhistas. Ao criar uma conta ou contratar um plano, a empresa contratante e os usuários convidados aceitam integralmente estas condições.',
  },
  {
    title: '2. Uso exclusivamente corporativo (B2B)',
    body: 'A plataforma é destinada a pessoas jurídicas e a seus colaboradores devidamente cadastrados. A conta é da empresa, que é a responsável por cadastrar colaboradores, definir políticas internas, obter as autorizações necessárias e manter a veracidade dos dados informados.',
  },
  {
    title: '3. Responsabilidades do empregador (controlador)',
    bullets: [
      'Informar seus colaboradores sobre o tratamento de dados, inclusive biometria facial e geolocalização, e manter prova das autorizações obtidas.',
      'Garantir que a coleta de biometria seja necessária e proporcional à finalidade de registro de jornada, oferecendo alternativa quando houver recusa justificada.',
      'Manter sigilo das credenciais de administrador e definir quem, dentro da empresa, acessa fichas, salários e registros de ponto.',
      'Utilizar os cálculos de encargos, custos e rescisão como apoio à decisão, conferindo-os com sua contabilidade antes de qualquer pagamento.',
    ],
  },
  {
    title: '4. Responsabilidades do Custo Real (operador)',
    body: 'O Custo Real se compromete a tratar os dados pessoais seguindo as instruções da empresa contratante e a LGPD, a manter a plataforma disponível com esforço comercialmente razoável, a aplicar medidas técnicas de segurança compatíveis com o estado da arte e a comunicar incidentes relevantes. O Custo Real não se responsabiliza por decisões trabalhistas, fiscais ou contábeis tomadas com base nos cálculos exibidos, que têm caráter informativo.',
  },
  {
    title: '5. Conta, senha e segurança dos usuários',
    body: 'O acesso é individual e intransferível. O usuário é responsável por manter a senha em sigilo e por toda atividade realizada com suas credenciais. A empresa deve revogar o acesso de colaboradores desligados. Tentativas de batida de ponto por terceiros, adulteração de horários, uso de fotos de tela ou qualquer fraude sujeitam o usuário à suspensão imediata e podem ser comunicadas à empresa empregadora.',
  },
  {
    title: '6. Registro de ponto, biometria e GPS',
    body: 'O ponto facial usa verificação automática de semelhança entre a selfie e a foto de referência, com prova de vida, e registra data, hora, unidade e localização do momento da batida. A conferência pode ser revisada pelo RH, que tem à disposição a justificativa e o ajuste manual com motivo obrigatório, registrados em auditoria.',
  },
  {
    title: '7. Planos, teste gratuito e pagamento',
    bullets: [
      'Teste gratuito: 7 dias de acesso ao plano PREMIUM, sem cobrança. Ao final, o acesso às funções do plano é bloqueado até a contratação.',
      'STARTER: R$ 29,90 por mês ou R$ 297 por ano, até 10 colaboradores e 1.000 batidas por mês.',
      'PREMIUM: R$ 59,90 por mês ou R$ 597 por ano (oferta de R$ 497 vitalício quando disponível), colaboradores e batidas ilimitados, rescisão, ranking de custo real e exportação contábil.',
      'As assinaturas contratadas pelo site ou pelo aplicativo são processadas por provedor de pagamentos (Stripe) e/ou pelas lojas Apple App Store e Google Play, com renovação automática até o cancelamento.',
      'Cancelamento: pode ser feito a qualquer momento; o acesso permanece até o fim do período já pago. Não há reembolso proporcional de períodos em curso, salvo exigência legal ou política da loja.',
      'Preços podem ser reajustados, com aviso prévio de 30 dias, sem afetar o ciclo já pago.',
    ],
  },
  {
    title: '8. Uso proibido',
    bullets: [
      'Copiar, revender, sublicenciar ou tentar obter o código-fonte da plataforma.',
      'Usar a ferramenta para rastrear trabalhadores fora do horário de trabalho ou para fins discriminatórios.',
      'Inserir dados de terceiros sem autorização, conteúdos ilícitos ou informações falsas de folha.'
    ],
  },
  {
    title: '9. Propriedade intelectual',
    body: 'O software, a marca Custo Real, o layout, os textos e a base de conhecimento são de titularidade do Custo Real. Os dados inseridos pela empresa permanecem dela e são exportáveis a qualquer momento, inclusive no encerramento do contrato.',
  },
  {
    title: '10. Suspensão e encerramento',
    body: 'O Custo Real pode suspender contas com indícios de fraude, inadimplência ou uso indevido. A empresa pode encerrar o contrato a qualquer momento; após o encerramento, os dados ficam disponíveis para exportação por 30 dias e depois são eliminados conforme a Política de Privacidade, ressalvadas as obrigações legais de guarda.',
  },
  {
    title: '11. Limitação de responsabilidade',
    body: 'A plataforma é fornecida "no estado em que se encontra", com disponibilidade alvo de 99,5% ao mês, excluídas manutenções programadas e falhas de terceiros. O Custo Real não responde por lucros cessantes, danos indiretos ou por multas decorrentes de informações incorretas inseridas pela empresa ou por seus usuários.',
  },
  {
    title: '12. Legislação e foro',
    body: 'Aplica-se a legislação brasileira, incluindo a LGPD (Lei 13.709/2018), a CLT e o Marco Civil da Internet (Lei 12.965/2014). Eventuais controvérsias serão resolvidas no foro da comarca da sede do Custo Real, salvo disposição legal em contrário.',
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Termos de Uso"
      updated="Última atualização: outubro de 2026 · Custo Real RH IA"
      sections={sections}
    />
  );
}