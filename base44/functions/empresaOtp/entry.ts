import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Código de verificação de 6 dígitos para o cadastro da primeira empresa.
// Envia pelo serviço de e-mail do próprio Base44 (SendEmail), que sempre chega
// para usuários cadastrados — contornando Gmail/Hotmail. O código vale 10 min.

const soDigitos = (v) => String(v || '').replace(/\D/g, '');

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Entre na sua conta para cadastrar a empresa.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || 'enviar');
    const email = String(body?.email || '').trim().toLowerCase();
    const sr = base44.asServiceRole;

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }

    if (action === 'enviar' || action === 'reenviar') {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
      // Rascunho do cadastro + código, ligados a quem pediu.
      await sr.entities.EmpresaOtp.create({
        email,
        code,
        expires_at: expiresAt,
        used: false,
        tentativas: 0,
        cnpj: soDigitos(body?.cnpj),
        nome: String(body?.nome || '').trim().slice(0, 120),
        funcionarios: Number(body?.funcionarios) || 0,
        created_by_id: user.id,
      });
      try {
        await sr.integrations.Core.SendEmail({
          to: email,
          from_name: 'Custo Real',
          subject: 'Seu código de verificação - Custo Real',
          text: `Seu código de verificação é: ${code}. Ele vale por 10 minutos.`,
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#0F172A;margin:0 0 12px">Custo Real</h2>
            <p style="font-size:16px;color:#334155;margin:0 0 8px">Seu código de verificação é:</p>
            <p style="font-size:34px;font-weight:700;letter-spacing:10px;color:#007bff;margin:0 0 12px">${code}</p>
            <p style="font-size:14px;color:#64748B;margin:0">Ele vale por 10 minutos. Se você não pediu este código, ignore este e-mail.</p>
          </div>`,
        });
      } catch (e) {
        console.error('[empresaOtp] erro ao enviar e-mail:', e?.message || e);
        return Response.json(
          { error: 'Não conseguimos enviar. Tente novamente ou fale no suporte.' },
          { status: 500 },
        );
      }
      console.log(`[empresaOtp] código enviado para ${email} (user ${user.id})`);
      return Response.json({ ok: true, email });
    }

    if (action === 'verificar') {
      const code = String(body?.code || '').trim();
      if (!/^\d{6}$/.test(code)) {
        return Response.json({ error: 'Digite o código de 6 dígitos.' }, { status: 400 });
      }
      const { items } = await sr.entities.EmpresaOtp.filter(
        { email, used: false },
        { sort: '-created_date', limit: 10 },
      );
      const otp = (items || []).find((o) => o.created_by_id === user.id && new Date(o.expires_at) > new Date());
      if (!otp) {
        return Response.json({ error: 'Código expirado. Reenvie um novo código.' }, { status: 400 });
      }
      if ((otp.tentativas || 0) >= 5) {
        return Response.json({ error: 'Muitas tentativas. Reenvie um novo código.' }, { status: 400 });
      }
      await sr.entities.EmpresaOtp.update(otp.id, { tentativas: (otp.tentativas || 0) + 1 });
      if (otp.code !== code) {
        return Response.json({ error: 'Código inválido. Confira o e-mail e tente de novo.' }, { status: 400 });
      }
      await sr.entities.EmpresaOtp.update(otp.id, { used: true });
      return Response.json({ ok: true, email });
    }

    return Response.json({ error: 'Ação inválida.' }, { status: 400 });
  } catch (error) {
    console.error('[empresaOtp] falhou:', error?.message || error);
    return Response.json({ error: 'Não foi possível processar agora.' }, { status: 500 });
  }
}