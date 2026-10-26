import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { nearestUnit } from '../../shared/geo.ts';

const asList = (p) => (Array.isArray(p) ? p : p?.items ?? []);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const employeeId = typeof body?.employee_id === 'string' ? body.employee_id : '';
    const selfieUri = typeof body?.selfie_uri === 'string' && body.selfie_uri.length < 600 ? body.selfie_uri : '';
    const lat = typeof body?.lat === 'number' ? body.lat : null;
    const lng = typeof body?.lng === 'number' ? body.lng : null;
    if (!employeeId || !selfieUri) {
      return Response.json({ error: 'Informe o colaborador e a selfie' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const emp = await sr.entities.Employee.get(employeeId);
    if (!emp || emp.active === false) {
      return Response.json({ error: 'Colaborador não encontrado ou inativo' }, { status: 404 });
    }

    // Segurança: só o próprio colaborador (mesmo e-mail) ou o RH pode bater o ponto.
    const isAdmin = user.role === 'admin';
    if (!isAdmin && (emp.email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
      await sr.entities.AuditLog.create({
        action: 'ponto_tentativa_outro_usuario',
        result: 'recusado',
        employee_id: emp.id,
        employee_name: emp.full_name,
        actor_email: user.email,
        details: 'Tentativa de registrar ponto em nome de outro colaborador.',
        selfie_uri: selfieUri,
      });
      return Response.json({ error: 'Você só pode registrar o seu próprio ponto.' }, { status: 403 });
    }

    if (!emp.face_ref_uri) {
      return Response.json({ error: 'Este colaborador ainda não tem rosto cadastrado. Peça ao RH.' }, { status: 400 });
    }

    const company = asList(await sr.entities.Company.list({ limit: 1 }))[0] || null;
    const minConfidence = Number(company?.min_confidence) || 80;

    const [refSigned, selfieSigned] = await Promise.all([
      sr.integrations.Core.CreateFileSignedUrl({ file_uri: emp.face_ref_uri, expires_in: 300 }),
      sr.integrations.Core.CreateFileSignedUrl({ file_uri: selfieUri, expires_in: 300 }),
    ]);

    const llm = await sr.integrations.Core.InvokeLLM({
      prompt: `Você é um sistema de verificação facial para registro de ponto. Há duas imagens: a PRIMEIRA é a foto de referência cadastrada do colaborador; a SEGUNDA é uma selfie tirada agora.
Decida se as duas imagens mostram a MESMA pessoa. Seja rigoroso: na dúvida, recuse.
Também verifique se a segunda imagem é uma selfie real e ao vivo de um rosto humano (e não uma foto de tela, impressão ou imagem sem rosto).
- same_person: true somente se for a mesma pessoa.
- live_face: true somente se parecer um rosto real e visível, sem sinais de fraude.
- confidence: de 0 a 100, sua confiança de que é a mesma pessoa (0 se não houver rosto).
- reason: explicação curta em português do Brasil (máx. 140 caracteres).`,
      file_urls: [refSigned.signed_url, selfieSigned.signed_url],
      response_json_schema: {
        type: 'object',
        properties: {
          same_person: { type: 'boolean' },
          live_face: { type: 'boolean' },
          confidence: { type: 'number' },
          reason: { type: 'string' },
        },
        required: ['same_person', 'live_face', 'confidence', 'reason'],
      },
    });
    const v = typeof llm === 'string' ? JSON.parse(llm) : llm ?? {};
    const confidence = Math.max(0, Math.min(100, Math.round(Number(v.confidence) || 0)));
    const reason = String(v.reason ?? '').slice(0, 200);
    const accepted = Boolean(v.same_person) && Boolean(v.live_face) && confidence >= minConfidence;

    if (!accepted) {
      await sr.entities.AuditLog.create({
        action: 'ponto_facial',
        result: 'recusado',
        employee_id: emp.id,
        employee_name: emp.full_name,
        actor_email: user.email,
        confidence,
        details: reason || 'Rosto não reconhecido.',
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        selfie_uri: selfieUri,
      });
      return Response.json({ accepted: false, confidence, reason });
    }

    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const todays = asList(await sr.entities.TimeEntry.filter({ employee_id: emp.id, day }, { limit: 100 }));
    const kind = todays.length % 2 === 0 ? 'entrada' : 'saida';

    let unit = emp.unit || '';
    let inside = null;
    if (lat !== null && lng !== null && company?.units?.length) {
      const near = nearestUnit(company.units, lat, lng);
      if (near) {
        unit = near.name;
        inside = near.inside;
      }
    }

    const entry = await sr.entities.TimeEntry.create({
      employee_id: emp.id,
      employee_name: emp.full_name,
      employee_email: (emp.email || '').toLowerCase(),
      kind,
      punched_at: now.toISOString(),
      day,
      confidence,
      selfie_uri: selfieUri,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      unit,
      inside_unit: inside ?? undefined,
    });

    await sr.entities.AuditLog.create({
      action: 'ponto_facial',
      result: 'sucesso',
      employee_id: emp.id,
      employee_name: emp.full_name,
      actor_email: user.email,
      confidence,
      details: `${kind === 'entrada' ? 'Entrada' : 'Saída'} registrada${unit ? ' · ' + unit : ''}${
        inside === false ? ' · FORA do raio da unidade' : ''
      }. ${reason}`.trim(),
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      selfie_uri: selfieUri,
    });

    return Response.json({
      accepted: true,
      kind,
      confidence,
      reason,
      punched_at: entry.punched_at,
      unit,
      inside_unit: inside,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Falha ao registrar o ponto' }, { status: 500 });
  }
}