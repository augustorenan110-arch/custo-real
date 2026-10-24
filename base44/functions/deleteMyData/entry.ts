import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

/**
 * Exclusão total dos dados do titular (LGPD, art. 18), solicitada pelo próprio
 * colaborador em Configurações → Privacidade e Dados.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me?.id) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const svc = base44.asServiceRole;
    const email = String(me.email || '').toLowerCase();
    const deleted: Record<string, number> = {};

    // 1) Biometria: remove a foto de referência da ficha do próprio colaborador.
    let employeeId = '';
    if (email) {
      const employees = await svc.entities.Employee.filter({ email }, { limit: 5 });
      for (const emp of employees) {
        employeeId = emp.id;
        await svc.entities.Employee.update(emp.id, { face_ref_uri: '' });
        deleted.employee_biometria = (deleted.employee_biometria || 0) + 1;
      }
    }

    // 2) Registros de ponto e selfies (por titular e pela ficha dele).
    const byOwner = await svc.entities.TimeEntry.deleteMany({ created_by_id: me.id });
    deleted.time_entry_owner = Number(byOwner?.deleted ?? 0);
    if (employeeId) {
      const byEmployee = await svc.entities.TimeEntry.deleteMany({ employee_id: employeeId });
      deleted.time_entry_employee = Number(byEmployee?.deleted ?? 0);
    }

    // 3) Despesas, recibos e dados de geolocalização (auditoria).
    const expenses = await svc.entities.Expense.deleteMany({ created_by_id: me.id });
    deleted.expense = Number(expenses?.deleted ?? 0);
    const logs = await svc.entities.AuditLog.deleteMany({ created_by_id: me.id });
    deleted.audit_log = Number(logs?.deleted ?? 0);

    // 4) Prova de cumprimento (LGPD, art. 16, II): registro mínimo, sem biometria.
    await svc.entities.AuditLog.create({
      action: 'Exclusão de dados do titular (LGPD art. 18)',
      result: 'sucesso',
      employee_id: employeeId || undefined,
      actor_email: me.email || '',
      details: `Pedido do próprio titular às ${new Date().toISOString()} · registros apagados: ${JSON.stringify(deleted)}`,
    });

    // 5) Conta de acesso.
    let accountDeleted = false;
    try {
      await svc.entities.User.delete(me.id);
      accountDeleted = true;
    } catch (error) {
      console.error('deleteMyData: falha ao apagar conta', error?.message);
    }

    return Response.json({ ok: true, deleted, account_deleted: accountDeleted });
  } catch (error) {
    console.error('deleteMyData: erro', error?.message);
    return Response.json({ error: error?.message || 'Erro inesperado' }, { status: 500 });
  }
}