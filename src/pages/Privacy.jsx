import LegalPage from '@/components/legal/LegalPage';

const sections = [
  {
    title: '1. Quem é o controlador',
    body: 'O Custo Real é uma plataforma de gestão de pessoas e custos usada por empresas (B2B). A empresa empregadora, cliente do Custo Real, é a controladora dos dados de seus colaboradores. O Custo Real atua como operador, tratando os dados exclusivamente conforme as instruções da empresa e a legislação aplicável (Lei 13.709/2018 — LGPD).',
  },
  {
    title: '2. Dados pessoais que tratamos',
    bullets: [
      'Dados cadastrais: nome completo, CPF, e-mail, cargo, unidade, salário bruto e data de admissão.',
      'Dados de jornada: data e hora das batidas de ponto, unidade reconhecida e status dentro/fora da unidade.',
      'Biometria facial (dado pessoal sensível): foto de referência e selfie capturada no momento da batida, com prova de vida.',
      'Geolocalização: latitude e longitude coletadas exclusivamente no instante da batida do ponto.',
      'Despesas: valor, data, estabelecimento, categoria, justificativa e imagem do recibo enviado.',
      'Registros de auditoria: quem executou cada ação, resultado, data, hora e endereço IP do consentimento.',
    ],
  },
  {
    title: '3. Finalidade do tratamento',
    bullets: [
      'Registrar a jornada de trabalho e comprovar a presença do colaborador na unidade no momento da batida.',
      'Cumprir a obrigação legal de registro eletrônico de ponto (CLT, art. 74, §§ 1º a 3º, e Portaria MTP 671/2021).',
      'Calcular custo real de folha, encargos (FGTS, 13º, férias, multa de 40%) e gastos com demissão.',
      'Conferir despesas corporativas contra a política da empresa e gerar holerites e espelhos de ponto.',
      'Prevenir fraudes no registro de ponto (batida por terceiros) e atender auditorias trabalhistas.',
    ],
  },
  {
    title: '4. Base legal (LGPD)',
    bullets: [
      'Cumprimento de obrigação legal ou regulatória pelo controlador — LGPD, art. 7º, II (registro de jornada, folha e obrigações trabalhistas).',
      'Execução de contrato de trabalho e procedimentos preliminares — LGPD, art. 7º, V.',
      'Consentimento específico e destacado para a biometria facial — LGPD, art. 11, I, coletado na tela "Bater Ponto" e revogável a qualquer momento.',
      'Legítimo interesse para segurança e prevenção de fraude — LGPD, art. 7º, IX, sempre limitado ao mínimo necessário.',
    ],
  },
  {
    title: '5. Consentimento e revogação',
    body: 'Antes da primeira batida, o colaborador autoriza expressamente a coleta da foto facial e da localização, com registro de data, hora e IP. A autorização é uma escolha livre: ao recusar, o ponto facial é bloqueado e o RH é orientado a registrar o ponto por outro meio. O consentimento pode ser revogado a qualquer momento em Configurações → Privacidade e Dados, sem prejuízo dos registros já realizados para cumprir obrigação legal.',
  },
  {
    title: '6. Localização: somente na batida',
    body: 'A localização é lida apenas no instante em que o colaborador toca em "Registrar ponto", para comprovar que ele está na unidade. Não há rastreamento contínuo, em segundo plano, fora do horário de trabalho nem durante o uso do aplicativo. A permissão utilizada é do tipo "somente durante o uso" (When In Use).',
  },
  {
    title: '7. Segurança da informação',
    bullets: [
      'Dados e arquivos sensíveis são criptografados em repouso com AES-256 e protegidos por TLS 1.2+ em trânsito.',
      'Fotos faciais, selfies e recibos ficam em armazenamento privado, acessível apenas por links assinados de curta duração.',
      'O acesso é segregado por perfil: o colaborador vê apenas os próprios dados; o RH acessa os dados da sua empresa.',
      'Todas as ações relevantes geram registro de auditoria com data, hora, autor e resultado.',
      'Senhas nunca são armazenadas em texto claro e a autenticação é gerenciada por provedor especializado.',
    ],
  },
  {
    title: '8. Compartilhamento',
    body: 'Não vendemos dados pessoais e não os usamos para publicidade. O compartilhamento ocorre apenas com subprocessadores necessários à operação (infraestrutura em nuvem, envio de e-mail transacional e processamento de imagem por IA), sempre sob contrato e com cláusulas de proteção de dados, ou por determinação legal, judicial ou de autoridade competente. A empresa contratante pode exportar os dados que lhe pertencem (contador, auditoria e perícia).',
  },
  {
    title: '9. Retenção',
    body: 'Os registros de ponto, fotos, geolocalização, espelhos e comprovantes são mantidos por 5 (cinco) anos, prazo necessário para atender a fiscalizações trabalhistas, previdenciárias e a eventual prescrição quinquenal de créditos trabalhistas. Depois desse prazo, os dados são eliminados ou anonimizados. Quando o titular solicita a exclusão total, aplicamos a LGPD, art. 18, observado o art. 16.',
  },
  {
    title: '10. Direito de exclusão total',
    body: 'O titular pode excluir permanentemente a conta e a biometria facial, em 3 passos:',
    bullets: [
      'Abra o aplicativo e entre com a sua conta.',
      'Vá em Configurações → Privacidade e Dados.',
      'Toque em "Excluir minha conta e biometria facial", digite EXCLUIR e confirme.',
      'Alternativa por e-mail: escreva para dpo@custoreal.com.br com o assunto "Exclusão de dados" e o pedido é atendido em até 48 horas.',
    ],
  },
  {
    title: '11. Direitos do titular',
    body: 'Nos termos do art. 18 da LGPD, você pode solicitar a confirmação do tratamento, o acesso, a correção, a anonimização, a portabilidade, a eliminação dos dados tratados com consentimento e a informação sobre compartilhamentos. Requisições são respondidas pelo DPO em até 15 dias. Você também pode peticionar à ANPD (Autoridade Nacional de Proteção de Dados).',
  },
  {
    title: '12. Menores e transferência internacional',
    body: 'A plataforma é destinada ao ambiente de trabalho corporativo e não deve ser usada por menores de 18 anos. Alguns subprocessadores de infraestrutura podem manter dados em servidores fora do Brasil, com garantias contratuais de proteção equivalentes às da LGPD (art. 33).',
  },
  {
    title: '13. Incidentes e alterações',
    body: 'Em caso de incidente de segurança relevante, a empresa controladora e os titulares afetados são comunicados em prazo razoável, com descrição do ocorrido e das medidas adotadas (art. 48). Esta política pode ser atualizada para refletir mudanças legais ou do produto; a data da última atualização é sempre exibida no topo desta página.',
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Política de Privacidade e Proteção de Dados (LGPD)"
      updated="Última atualização: outubro de 2026 · Custo Real RH IA"
      sections={sections}
    />
  );
}