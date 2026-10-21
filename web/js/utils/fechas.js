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
export { Bo, El, Ho, Us, ah, jf, lh, sh, un, xa };
