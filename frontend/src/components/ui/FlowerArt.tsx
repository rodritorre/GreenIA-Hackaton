import type { Ilustracion } from '../../api';

// Hand-drawn species illustrations used on destination headers and cards.
// Each is drawn in a 120×120 box; decorative only.

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Cherry: notched petals, deep-pink eye, clustered on a dark branch. */
function Cerezo() {
  const petal = 'M0 0 C-11 -6 -14 -22 -6 -30 L0 -25 L6 -30 C14 -22 11 -6 0 0Z';
  const blossom = (x: number, y: number, s: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {range(5).map((i) => (
        <path key={i} d={petal} transform={`rotate(${i * 72})`} fill="#FBD3DE" stroke="#E68AA6" strokeWidth="1.2" />
      ))}
      {range(9).map((i) => {
        const a = (i * 40 * Math.PI) / 180;
        return (
          <g key={i}>
            <line x1="0" y1="0" x2={Math.cos(a) * 11} y2={Math.sin(a) * 11} stroke="#C2185B" strokeWidth="1" />
            <circle cx={Math.cos(a) * 11} cy={Math.sin(a) * 11} r="1.4" fill="#F9C74F" />
          </g>
        );
      })}
      <circle r="4" fill="#D94A75" />
    </g>
  );
  return (
    <>
      <path d="M4 112 C30 92 48 80 70 66 C86 56 100 40 116 18" fill="none" stroke="#5B3A2E" strokeWidth="6" strokeLinecap="round" />
      <path d="M58 74 C60 60 56 50 48 40" fill="none" stroke="#5B3A2E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M92 47 C100 54 108 56 116 56" fill="none" stroke="#5B3A2E" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="111" cy="56" rx="4" ry="6" transform="rotate(70 111 56)" fill="#E68AA6" />
      <ellipse cx="45" cy="36" rx="3.5" ry="5.5" transform="rotate(-30 45 36)" fill="#E68AA6" />
      {blossom(30, 92, 0.9, 10)}
      {blossom(66, 62, 1.15, -8)}
      {blossom(98, 30, 0.85, 20)}
    </>
  );
}

/** Almond: rounded white petals blushing pink at the base, long stamens, leafless twig. */
function Almendro() {
  const petal = 'M0 0 C-14 -4 -16 -27 0 -29 C16 -27 14 -4 0 0Z';
  const blush = 'M0 0 C-6 -2 -7 -12 0 -13 C7 -12 6 -2 0 0Z';
  const blossom = (x: number, y: number, s: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {range(5).map((i) => (
        <g key={i} transform={`rotate(${i * 72})`}>
          <path d={petal} fill="#FFF6F8" stroke="#E7B3C2" strokeWidth="1.2" />
          <path d={blush} fill="#F2A1B8" />
        </g>
      ))}
      {range(12).map((i) => {
        const a = (i * 30 * Math.PI) / 180;
        const l = i % 2 ? 13 : 16;
        return (
          <g key={i}>
            <line x1="0" y1="0" x2={Math.cos(a) * l} y2={Math.sin(a) * l} stroke="#9C2C55" strokeWidth="0.9" />
            <circle cx={Math.cos(a) * l} cy={Math.sin(a) * l} r="1.3" fill="#7A3B12" />
          </g>
        );
      })}
      <circle r="3.6" fill="#8E244D" />
    </g>
  );
  return (
    <>
      <path d="M8 22 C30 34 52 52 66 72 C78 90 92 102 114 110" fill="none" stroke="#4A3428" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 72 C74 62 86 56 100 54" fill="none" stroke="#4A3428" strokeWidth="3" strokeLinecap="round" />
      <circle cx="102" cy="53" r="4" fill="#F2A1B8" />
      {blossom(34, 38, 0.95, 15)}
      {blossom(80, 86, 1.1, -5)}
      {blossom(88, 50, 0.7, 30)}
    </>
  );
}

/** Lavender: three spikes of tiny florets on slim stems, grey-green leaves. */
function Lavanda() {
  const spike = (x: number, top: number, lean: number, key: number) => {
    const florets = range(9).map((i) => {
      const y = top + i * 6.5;
      const w = 3.2 + Math.min(i, 5) * 0.25;
      const shade = ['#5E35B1', '#7E57C2', '#9575CD'][i % 3];
      return (
        <g key={i}>
          <ellipse cx={x + lean * (i / 9) - w} cy={y} rx={w} ry="2.6" transform={`rotate(-28 ${x - w} ${y})`} fill={shade} />
          <ellipse cx={x + lean * (i / 9) + w} cy={y + 2} rx={w} ry="2.6" transform={`rotate(28 ${x + w} ${y + 2})`} fill={shade} />
        </g>
      );
    });
    return (
      <g key={key}>
        <path d={`M${x + lean} ${top + 60} C${x + lean * 0.6} ${top + 80} ${x + lean * 0.2} 100 ${60} 116`} fill="none" stroke="#6E8B4E" strokeWidth="2.4" strokeLinecap="round" />
        <line x1={x} y1={top} x2={x + lean} y2={top + 60} stroke="#6E8B4E" strokeWidth="2" />
        {florets}
      </g>
    );
  };
  return (
    <>
      {spike(36, 14, 14, 1)}
      {spike(62, 6, 0, 2)}
      {spike(88, 16, -14, 3)}
      <path d="M60 116 C46 106 34 100 20 98" fill="none" stroke="#8FA67A" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 116 C74 106 88 102 104 100" fill="none" stroke="#8FA67A" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

/** Beech: three autumn leaves with straight parallel veins and a wavy edge. */
function Haya() {
  const leaf = (x: number, y: number, r: number, fill: string, vein: string, key: number) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${r})`}>
      <path
        d="M0 0 C9 -3 15 -10 17 -18 C18 -24 18 -32 14 -40 C11 -46 6 -52 0 -60 C-6 -52 -11 -46 -14 -40 C-18 -32 -18 -24 -17 -18 C-15 -10 -9 -3 0 0Z"
        fill={fill}
        stroke={vein}
        strokeWidth="1.2"
      />
      <line x1="0" y1="4" x2="0" y2="-58" stroke={vein} strokeWidth="1.4" />
      {range(7).map((i) => {
        const yy = -8 - i * 6.5;
        const w = [12, 15, 16, 15, 13, 10, 6][i];
        return (
          <g key={i} stroke={vein} strokeWidth="0.9">
            <line x1="0" y1={yy} x2={w} y2={yy - 7} />
            <line x1="0" y1={yy} x2={-w} y2={yy - 7} />
          </g>
        );
      })}
    </g>
  );
  return (
    <>
      <path d="M60 116 C60 100 58 90 56 82" fill="none" stroke="#6B4423" strokeWidth="3" strokeLinecap="round" />
      {leaf(56, 84, -38, '#E8A33A', '#9A5B1A', 1)}
      {leaf(58, 84, 34, '#C8662B', '#7A3416', 2)}
      {leaf(57, 80, -2, '#A8411E', '#5E2410', 3)}
      <g transform="translate(92 98)">
        <path d="M0 0 L-7 -10 L0 -16 L7 -10Z" fill="#7A5230" />
        <path d="M0 -16 L-3 -20 M0 -16 L3 -20 M-7 -10 L-11 -11 M7 -10 L11 -11" stroke="#7A5230" strokeWidth="1.2" />
      </g>
    </>
  );
}

const ART: Record<Ilustracion, () => JSX.Element> = {
  cerezo: Cerezo,
  almendro: Almendro,
  lavanda: Lavanda,
  haya: Haya,
};

export function FlowerArt({ kind, size = 120, className }: { kind: Ilustracion; size?: number; className?: string }) {
  const Art = ART[kind];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 120 120" className={className}>
      <Art />
    </svg>
  );
}
