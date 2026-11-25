import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { reverseGeocode } from '../../shared/reverseGeocode.ts';

const asList = (p) => (Array.isArray(p) ? p : p?.items ?? []);

// Resolve endereços de pontos/logs que ficaram só com latitude/longitude
// (sem internet na hora da batida, ou API indisponível). Chamada pelo admin
// quando entra na tela de Auditoria — preenche o endereço quando a internet já voltou.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Não autorizado' }, { status: 403 });
    }
    const sr = base44.asServiceRole;
    const companyId = user.data?.company_id;
    const isSuperAdmin = user.data?.is_super_admin === true;
    const scope = isSuperAdmin || !companyId ? {} : { company_id: companyId };

    const entries = asList(
      await sr.entities.TimeEntry.filter(
        { ...scope, lat: { $exists: true } },
        { limit: 60, sort: '-created_date' },
      ),
    ).filter((e) => !e.endereco && typeof e.lat === 'number');

    const logs = asList(
      await sr.entities.AuditLog.filter(
        { ...scope, lat: { $exists: true } },
        { limit: 60, sort: '-created_date' },
      ),
    ).filter((l) => !l.endereco && typeof l.lat === 'number');

    let resolved = 0;
    for (const e of entries.slice(0, 20)) {
      const geo = await reverseGeocode(e.lat, e.lng);
      if (geo?.endereco && geo.endereco !== '—') {
        await sr.entities.TimeEntry.update(e.id, {
          rua: geo.rua,
          bairro: geo.bairro,
          cidade_uf: geo.cidade_uf,
          endereco: geo.endereco,
        });
        resolved++;
      }
    }
    for (const l of logs.slice(0, 20)) {
      const geo = await reverseGeocode(l.lat, l.lng);
      if (geo?.endereco && geo.endereco !== '—') {
        await sr.entities.AuditLog.update(l.id, {
          rua: geo.rua,
          bairro: geo.bairro,
          cidade_uf: geo.cidade_uf,
          endereco: geo.endereco,
        });
        resolved++;
      }
    }

    return Response.json({ resolved, checked: entries.length + logs.length });
  } catch (error) {
    return Response.json({ error: error.message || 'Falha ao resolver endereços' }, { status: 500 });
  }
}