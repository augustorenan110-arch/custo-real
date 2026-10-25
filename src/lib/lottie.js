// Animações Lottie leves (vetor puro, ~1KB cada) usadas nos ícones do app.
// Só três movimentos: pulso, varredura de rosto e oscilação de alerta.

const FR = 30;
const LOOP = 90; // 3s

function toRgb(hex) {
  const clean = (hex || '#22C55E').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255, 1];
}

function layer(ks, shapes, opacity = LOOP) {
  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: 'icon',
    sr: 1,
    ks,
    ao: 0,
    shapes,
    ip: 0,
    op: opacity,
    st: 0,
    bm: 0,
  };
}

function root(w, h, op, layers, nm) {
  return { v: '5.7.4', fr: FR, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers };
}

// Anel que pulsa ao redor do ícone (usado em alertas, travas, checks e relógio).
export function pulseRing(color) {
  const rgb = toRgb(color);
  const size = 100;
  const shapes = [
    {
      ty: 'gr',
      nm: 'ring',
      it: [
        { ty: 'el', nm: 'e', d: 1, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [58, 58] } },
        { ty: 'st', nm: 's', c: { a: 0, k: rgb }, o: { a: 0, k: 100 }, w: { a: 0, k: 7 }, lc: 2, lj: 2 },
        {
          ty: 'tr',
          nm: 't',
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 },
        },
      ],
    },
  ];
  const ks = {
    o: { a: 1, k: [{ t: 0, s: [80] }, { t: 45, s: [8] }, { t: 90, s: [80] }] },
    r: { a: 0, k: 0 },
    p: { a: 0, k: [size / 2, size / 2, 0] },
    a: { a: 0, k: [0, 0, 0] },
    s: {
      a: 1,
      k: [
        { t: 0, s: [42, 42, 100] },
        { t: 45, s: [100, 100, 100] },
        { t: 90, s: [42, 42, 100] },
      ],
    },
  };
  return root(size, size, LOOP, [layer(ks, shapes)], 'pulse-ring');
}

// Barra que sobe e desce, simulando a leitura do rosto.
export function scanLine(color) {
  const rgb = toRgb(color);
  const size = 100;
  const shapes = [
    {
      ty: 'gr',
      nm: 'line',
      it: [
        { ty: 'rc', nm: 'r', d: 1, s: { a: 0, k: [58, 6] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
        { ty: 'fl', nm: 'f', c: { a: 0, k: rgb }, o: { a: 0, k: 95 } },
        {
          ty: 'tr',
          nm: 't',
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 },
        },
      ],
    },
  ];
  const ks = {
    o: { a: 1, k: [{ t: 0, s: [100] }, { t: 15, s: [100] }, { t: 30, s: [15] }, { t: 45, s: [100] }, { t: 60, s: [100] }] },
    r: { a: 0, k: 0 },
    p: {
      a: 1,
      k: [
        { t: 0, s: [size / 2, 20, 0] },
        { t: 30, s: [size / 2, 80, 0] },
        { t: 60, s: [size / 2, 20, 0] },
      ],
    },
    a: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: [100, 100, 100] },
  };
  return root(size, size, 60, [layer(ks, shapes, 60)], 'scan-line');
}

// Oscilação curta, para chamar atenção sem piscar demais.
export function shakeAlert(color) {
  const rgb = toRgb(color);
  const size = 100;
  const shapes = [
    {
      ty: 'gr',
      nm: 'dot',
      it: [
        { ty: 'el', nm: 'e', d: 1, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [46, 46] } },
        { ty: 'fl', nm: 'f', c: { a: 0, k: rgb }, o: { a: 0, k: 100 } },
        {
          ty: 'tr',
          nm: 't',
          p: { a: 0, k: [0, 0] },
          a: { a: 0, k: [0, 0] },
          s: { a: 0, k: [100, 100] },
          r: { a: 0, k: 0 },
          o: { a: 0, k: 100 },
          sk: { a: 0, k: 0 },
          sa: { a: 0, k: 0 },
        },
      ],
    },
  ];
  const ks = {
    o: { a: 0, k: 100 },
    r: { a: 0, k: 0 },
    p: {
      a: 1,
      k: [
        { t: 0, s: [44, size / 2, 0] },
        { t: 8, s: [56, size / 2, 0] },
        { t: 16, s: [44, size / 2, 0] },
        { t: 24, s: [50, size / 2, 0] },
        { t: 40, s: [50, size / 2, 0] },
      ],
    },
    a: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: [100, 100, 100] },
  };
  return root(size, size, 40, [layer(ks, shapes, 40)], 'shake-alert');
}