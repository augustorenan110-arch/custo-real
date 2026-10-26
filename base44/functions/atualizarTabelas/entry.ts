import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Verificação automática das tabelas oficiais (INSS, FGTS, IRRF, salário mínimo
// e INSS patronal). Sempre devolve os valores gravados em ConfigFiscal — nunca
// valores chapados no código — e avisa o administrador todo dia 10 de janeiro,
// quando sai a nova portaria do INSS, para conferir a tabela em gov.br/inss.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Entre na sua conta para verificar as tabelas oficiais.' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Apenas o administrador pode verificar as tabelas oficiais.' }, { status: 403 });
    }

    const pagina = await base44.asServiceRole.entities.ConfigFiscal.list({ sort: 'nome_tabela', limit: 200 });
    const tabelas = Array.isArray(pagina) ? pagina : pagina?.items || [];
    if (!tabelas.length) {
      return Response.json({ error: 'Nenhuma tabela oficial cadastrada.' }, { status: 404 });
    }

    const hoje = new Date();
    const janela = hoje.getMonth() === 0 && hoje.getDate() === 10;
    let aviso = null;

    if (janela) {
      const titulo = `Verificar tabela INSS ${hoje.getFullYear()}`;
      const existentes = await base44.asServiceRole.entities.Notification.filter({ titulo });
      const lista = Array.isArray(existentes) ? existentes : existentes?.items || [];
      if (!lista.length) {
        await base44.asServiceRole.entities.Notification.create({
          titulo,
          mensagem:
            'Nova portaria do INSS deve sair hoje. Confirme os valores em gov.br/inss antes de rodar a folha deste ano.',
          lida: false,
          criada_em: hoje.toISOString(),
        });
      }
      aviso =
        'Todo dia 10 de janeiro o Custo Real avisa: confira a nova portaria do INSS em gov.br/inss e atualize a tabela aqui.';
    }

    const atualizadoEm =
      tabelas
        .map((t) => t.atualizado_em)
        .filter(Boolean)
        .sort()
        .pop() || null;

    return Response.json({
      tabelas,
      total: tabelas.length,
      atualizado_em: atualizadoEm,
      aviso,
      janela,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}