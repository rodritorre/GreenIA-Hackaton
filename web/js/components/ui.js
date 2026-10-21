import { a } from "../vendor/react.min.js";
import { tt } from "../i18n.js";
import { He } from "./icons.js";

function zr({ fase: f, size: v }) {
  const m = v ?? hh[f];
  return a.jsxs("svg", {
    "aria-hidden": "true",
    width: m,
    height: m,
    viewBox: "0 0 32 32",
    className: "glyph",
    children: [
      f === "fuera_temporada" &&
        a.jsx("circle", {
          cx: "16",
          cy: "16",
          r: "13",
          fill: "#fff",
          stroke: "var(--fase-fuera)",
          strokeWidth: "3",
          strokeDasharray: "4 3",
        }),
      (f === "inicio" || f === "avance") &&
        a.jsxs(a.Fragment, {
          children: [
            a.jsx("circle", { cx: "16", cy: "16", r: "14", fill: "#fff" }),
            a.jsx("path", {
              d:
                f === "inicio"
                  ? "M16 16 L16 2 A14 14 0 0 1 30 16 Z"
                  : "M16 16 L16 2 A14 14 0 0 1 16 30 Z",
              fill: `var(--fase-${f})`,
            }),
            a.jsx("circle", {
              cx: "16",
              cy: "16",
              r: "14",
              fill: "none",
              stroke: "var(--ink)",
              strokeWidth: "1.6",
            }),
          ],
        }),
      f === "pleno" &&
        a.jsx("circle", {
          cx: "16",
          cy: "16",
          r: "14",
          fill: "var(--fase-pleno)",
          stroke: "var(--ink)",
          strokeWidth: "1.6",
        }),
      f === "final" &&
        a.jsxs(a.Fragment, {
          children: [
            a.jsx("circle", {
              cx: "16",
              cy: "16",
              r: "10.5",
              fill: "#fff",
              stroke: "var(--fase-final)",
              strokeWidth: "7",
            }),
            a.jsx("circle", {
              cx: "16",
              cy: "16",
              r: "14",
              fill: "none",
              stroke: "var(--ink)",
              strokeWidth: "1.6",
            }),
          ],
        }),
    ],
  });
}
const hh = { fuera_temporada: 16, inicio: 22, avance: 24, pleno: 30, final: 22 };
function Ku({ fase: f, tipo: v, short: m = !1 }) {
  const { t: j } = tt(),
    T = j(m || !v ? `fase.short.${f}` : `fase.${v}.${f}`);
  return a.jsxs("span", {
    className: `pill pill--${f}`,
    children: [a.jsx(zr, { fase: f, size: 12 }), T],
  });
}
function ps({ confianza: f, probabilidad: v }) {
  const { t: m } = tt();
  return a.jsxs("span", {
    className: `conf conf--${f}`,
    children: [
      a.jsxs("span", {
        className: "conf__bars",
        "aria-hidden": "true",
        children: [a.jsx("i", {}), a.jsx("i", {}), a.jsx("i", {})],
      }),
      m(`confianza.${f}`),
      v !== void 0 &&
        a.jsxs("span", {
          className: "conf__prob",
          children: [" · ", m("confianza.prob", { p: Math.round(v * 100) })],
        }),
    ],
  });
}
const Nf = { observado: "check", estimado: "satellite", previsto: "calc", editorial: "book" };
function Mr({ tipo: f }) {
  const { t: v } = tt();
  return a.jsxs("span", {
    className: `dtag dtag--${f}`,
    children: [a.jsx(He, { name: Nf[f], size: 13 }), v(`tipoDato.${f}`)],
  });
}
function $s({ capa: f, children: v }) {
  const { t: m } = tt(),
    j = f === "calculada" ? "calc" : f === "editorial" ? "book" : "tag";
  return a.jsxs("div", {
    className: `layer layer--${f}`,
    children: [
      a.jsxs("span", {
        className: "layer__chip",
        children: [a.jsx(He, { name: j, size: 14 }), m(`capa.${f}`)],
      }),
      v,
    ],
  });
}
function Qu() {
  const { t: f } = tt();
  return a.jsx("span", { className: "sponsored", children: f("ficha.sponsored") });
}
function Tl({ children: f, tone: v = "forecast" }) {
  return a.jsx("p", { className: `eyebrow eyebrow--${v}`, children: f });
}

export { $s, Ku, Mr, Qu, Tl, hh, ps, zr };
