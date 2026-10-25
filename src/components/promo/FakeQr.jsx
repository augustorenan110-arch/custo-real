import React from "react";

const SIZE = 21;

// Gerador determinístico (pseudo-aleatório) — QR apenas decorativo.
function seedRandom() {
  let s = 42;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function inFinder(x, y) {
  const box = (bx, by) => x >= bx && x < bx + 7 && y >= by && y < by + 7;
  return box(0, 0) || box(SIZE - 7, 0) || box(0, SIZE - 7);
}

function finderModule(x, y) {
  const lx = x < 7 ? x : x - (SIZE - 7);
  const ly = y < 7 ? y : y - (SIZE - 7);
  const ring = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return ring || core;
}

export default function FakeQr({ className = "h-40 w-40" }) {
  const random = seedRandom();
  const cells = [];

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const on = inFinder(x, y) ? finderModule(x, y) : random() > 0.52;
      if (on) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#08080A" />);
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} role="img" aria-label="QR Code">
      <rect width={SIZE} height={SIZE} fill="#ffffff" />
      {cells}
    </svg>
  );
}