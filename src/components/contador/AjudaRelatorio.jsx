export default function AjudaRelatorio({ open }) {
  if (!open) return null;

  return (
    <div
      style={{
        background: '#1E293B',
        borderRadius: '12px',
        padding: '12px',
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <details style={{ background: '#08080A', borderRadius: '8px', padding: '10px' }}>
        <summary style={{ color: 'white', fontSize: '13px', cursor: 'pointer' }}>
          O que é Passivo Oculto R$3.640?
        </summary>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '6px' }}>
          É o que você teria que pagar HOJE se demitisse. Saldo FGTS (8% ao mês) + multa 40% + aviso prévio + 13º +
          férias proporcionais. Seu app calcula automático.
        </p>
      </details>

      <details style={{ background: '#08080A', borderRadius: '8px', padding: '10px' }}>
        <summary style={{ color: 'white', fontSize: '13px', cursor: 'pointer' }}>
          Por que Custo Real é R$2.993 e não R$2.000?
        </summary>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '6px' }}>
          R$2.000 + FGTS 8% (R$160) + INSS 27,8% (R$556) + provisões de 13º e férias (R$277) = R$2.993. Você paga isso
          todo mês mesmo sem ver.
        </p>
      </details>

      <details style={{ background: '#08080A', borderRadius: '8px', padding: '10px' }}>
        <summary style={{ color: 'white', fontSize: '13px', cursor: 'pointer' }}>
          Relatório pro contador vale mesmo?
        </summary>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '6px' }}>
          Sim. É um PDF com folha, passivo, risco de ponto. Leva pro contador fechar a folha. Contadores amam porque já
          vem quebrado.
        </p>
      </details>

      <details style={{ background: '#08080A', borderRadius: '8px', padding: '10px' }}>
        <summary style={{ color: 'white', fontSize: '13px', cursor: 'pointer' }}>
          Como arrumar risco de ponto?
        </summary>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '6px' }}>
          Ative Ponto Facial no menu Ponto. Cadastre o rosto do funcionário. Isso gera prova contra processo
          trabalhista.
        </p>
      </details>

      <div style={{ marginTop: '4px', display: 'flex', gap: '8px' }}>
        <a
          href="https://wa.me/55SEUNUMERO?text=Duvida Custo Real"
          style={{
            flex: 1,
            background: '#22C55E',
            borderRadius: '8px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'black',
            fontWeight: 'bold',
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          WhatsApp Suporte
        </a>
      </div>
    </div>
  );
}