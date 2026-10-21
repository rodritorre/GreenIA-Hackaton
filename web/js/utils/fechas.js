import { Zo, oh } from "../data/ofertas.js";

function Us(f, v) {
  return new Date(Zo(f).getTime() + v * oh).toISOString().slice(0, 10);
}
function Bo(f, v) {
  return Math.round((Zo(f).getTime() - Zo(v).getTime()) / oh);
}
const Pl = (f) => (f === "en" ? "en-GB" : "es-ES");
function un(f, v, m = !1) {
  return Zo(f).toLocaleDateString(Pl(v), {
    day: "numeric",
    month: "short",
    year: m ? "numeric" : void 0,
    timeZone: "UTC",
  });
}
function sh(f, v) {
  const m = Zo(f).toLocaleDateString(Pl(v), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return m.charAt(0).toUpperCase() + m.slice(1);
}
function El(f, v, m = "long") {
  return Zo(f).toLocaleDateString(Pl(v), { month: m, timeZone: "UTC" });
}
function Ho(f, v) {
  return new Date(f).toLocaleString(Pl(v), {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}
function xa(f, v, m, j = !1) {
  return `${f.slice(0, 7) === v.slice(0, 7) ? String(Zo(f).getUTCDate()) : un(f, m)} – ${un(v, m, j)}`;
}
function jf(f, v) {
  return un(`2026-${f}`, v);
}
function ah(f) {
  return f.slice(0, 8) + "01";
}
function lh(f, v) {
  const m = Zo(f);
  return (m.setUTCMonth(m.getUTCMonth() + v, 1), m.toISOString().slice(0, 10));
}
function Cf(f) {
  let v = f;
  return () => ((v = (v * 16807) % 2147483647), (v - 1) / 2147483646);
}
const uh = (f, v, m) => 0.08 + 0.85 / (1 + Math.exp(-(f - v) / m)),
  ch = "2026-09-01",
  dh = 48,
  Pf = new Set([
    "2026-09-12",
    "2026-09-13",
    "2026-09-27",
    "2026-10-03",
    "2026-10-11",
    "2026-10-12",
  ]);
function Ef() {
  const f = Cf(7),
    v = [];
  for (let m = 0; m <= 49; m++) {
    const j = Us(ch, m),
      T = Pf.has(j),
      S = Math.max(0, Math.min(1, uh(m, dh, 6) + (f() - 0.5) * 0.04)),
      M = 27 - m * 0.26 + (f() - 0.5) * 4;
    v.push({
      fecha: j,
      indice: T ? null : Number(S.toFixed(3)),
      calidad: T ? "nubes" : "ok",
      tMax: Number(M.toFixed(1)),
    });
  }
  return v;
}
function Tf() {
  const f = [];
  for (let v = 50; v <= 75; v++) {
    const m = v > 66 ? (v - 66) * 0.03 : 0,
      j = Math.min(0.95, uh(v, dh, 6)) - m,
      T = 0.03 + (v - 50) * 0.006;
    f.push({
      fecha: Us(ch, v),
      p10: Number(Math.max(0, j - T).toFixed(3)),
      p50: Number(j.toFixed(3)),
      p90: Number(Math.min(1, j + T).toFixed(3)),
    });
  }
  return f;
}

export { Bo, Ef, El, Ho, Tf, Us, ah, jf, lh, sh, un, xa };
