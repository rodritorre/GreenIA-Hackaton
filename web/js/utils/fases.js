import { Bo, Us } from "./fechas.js";

const qt = "2026-10-20",
  Df = "2026-10-20T07:00:00+02:00",
  Vu = [
    [35.8, -9.6],
    [43.9, 4.4],
  ],
  fh = ["inicio", "avance", "pleno", "final"],
  Af = (f) => Us(f.desde, Math.round(Bo(f.hasta, f.desde) / 2));
function Cl(f, v) {
  const m = f.ventanas.find((M) => M.desde > v) ?? null,
    j = f.ventanas.find((M) => M.desde <= v && v <= M.hasta && M.tipoDato === "previsto") ?? null;
  if (v === qt) {
    const M = f.ventanas.find((b) => b.fase === f.estado.fase);
    return {
      fase: f.estado.fase,
      tipoDato: f.estado.tipoDato,
      confianza: M && M.tipoDato !== "previsto" ? M.confianza : "alta",
      esPrevision: !1,
      transicion: null,
      siguiente: m,
    };
  }
  if (v > f.finTemporada)
    return {
      fase: "fuera_temporada",
      tipoDato: "previsto",
      confianza: "media",
      esPrevision: !0,
      transicion: null,
      siguiente: null,
    };
  const T = f.ventanas.filter((M) => Af(M) <= v),
    S = T[T.length - 1];
  return S
    ? {
        fase: S.fase,
        tipoDato: v > qt ? "previsto" : S.tipoDato,
        confianza: j ? j.confianza : S.confianza,
        esPrevision: v > qt,
        transicion: j,
        siguiente: m,
      }
    : {
        fase: "fuera_temporada",
        tipoDato: "previsto",
        confianza: j ? j.confianza : "alta",
        esPrevision: v > qt,
        transicion: j,
        siguiente: m,
      };
}
const ro = (f) => f.ventanas.find((v) => v.fase === "pleno");
function ph(f, v, m) {
  const j = `${v}-${String(m).padStart(2, "0")}-01`,
    T = Us(`${m === 12 ? v + 1 : v}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01`, -1),
    S = ro(f);
  return S.desde <= T && S.hasta >= j ? 2 : f.ventanas[0].desde <= T && f.finTemporada >= j ? 1 : 0;
}

export { Cl, Df, Vu, fh, ph, qt, ro };
