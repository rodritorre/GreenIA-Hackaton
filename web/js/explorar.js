import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He } from "./components/icons.js";
import { wa } from "./data/ofertas.js";
import { El, sh, un } from "./utils/fechas.js";
import { Ot, oo } from "./data/destinos.js";
import { $s, Ku, Mr, Qu, Tl, ps, zr } from "./components/ui.js";
import { Cl, qt, ro } from "./utils/fases.js";
import { Ep, Pp } from "./map/map.js";
import { jh } from "./components/ilustraciones.js";
import { Fp } from "./ficha.js";

const Yd = (f) => f.e.fase !== "fuera_temporada";
function Bp(f) {
  const { t: v, lang: m } = tt(),
    j = f.all.filter(Yd).length,
    T = [
      { id: "all", label: v("map.all") },
      { id: "floracion", label: v("map.bloom") },
      { id: "color_otonal", label: v("map.autumn") },
    ];
  return a.jsxs(a.Fragment, {
    children: [
      a.jsxs("div", {
        className: "panel__head",
        children: [
          a.jsxs("div", {
            children: [
              a.jsx("p", {
                className: `label ${f.esPrevision ? "label--forecast" : "label--accent"}`,
                children: f.esPrevision ? v("map.modeForecast") : v("map.modeNow"),
              }),
              a.jsx("h3", { className: "panel__title", children: sh(f.fecha, m) }),
              a.jsx("p", {
                className: "muted",
                children: v("map.summary", { active: j, off: f.all.length - j }),
              }),
            ],
          }),
          a.jsxs("label", {
            className: "search",
            children: [
              a.jsx(He, { name: "search", size: 18 }),
              a.jsx("input", {
                type: "search",
                value: f.q,
                onChange: (S) => f.onQ(S.target.value),
                placeholder: v("map.search"),
                "aria-label": v("map.search"),
              }),
            ],
          }),
          a.jsx("div", {
            role: "group",
            "aria-label": v("map.filterLabel"),
            className: "chips",
            children: T.map((S) => {
              const M = f.all.filter((b) => (S.id === "all" || b.d.tipo === S.id) && Yd(b)).length;
              return a.jsxs(
                "button",
                {
                  type: "button",
                  className: "chip",
                  "aria-pressed": f.tipo === S.id,
                  onClick: () => f.onTipo(S.id),
                  children: [
                    S.label,
                    " ",
                    a.jsx("span", { className: "chip__count", children: M }),
                  ],
                },
                S.id,
              );
            }),
          }),
          a.jsxs("label", {
            className: "check",
            children: [
              a.jsx("input", {
                type: "checkbox",
                checked: f.off,
                onChange: (S) => f.onOff(S.target.checked),
              }),
              v("map.showOff"),
            ],
          }),
        ],
      }),
      a.jsx("ul", {
        className: "dest-list",
        children: f.visible.map(({ d: S, e: M }) =>
          a.jsx(
            "li",
            {
              children: a.jsxs("button", {
                type: "button",
                className: "dest-item",
                onClick: () => f.onSelect(S.id),
                children: [
                  a.jsx("span", {
                    className: "dest-item__glyph",
                    children: a.jsx(zr, { fase: M.fase }),
                  }),
                  a.jsxs("span", {
                    className: "dest-item__text",
                    children: [
                      a.jsx("span", { className: "dest-item__name", children: S.nombre }),
                      a.jsxs("span", {
                        className: "dest-item__meta",
                        children: [S.lugar, " · ", S.provincia],
                      }),
                      a.jsxs("span", {
                        className: "dest-item__tags",
                        children: [
                          M.fase === "fuera_temporada" && M.siguiente
                            ? a.jsx("span", {
                                className: "pill pill--fuera_temporada",
                                children: v("map.from", {
                                  when: `${El(M.siguiente.desde, m, "short").replace(".", "")} ${M.siguiente.desde.slice(0, 4)}`,
                                }),
                              })
                            : a.jsx(Ku, { fase: M.fase, short: !0 }),
                          M.esPrevision && a.jsx(ps, { confianza: M.confianza }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            },
            S.id,
          ),
        ),
      }),
      f.visible.length === 0 && a.jsx("p", { className: "empty", children: v("map.empty") }),
    ],
  });
}
const Zp = ["fuera_temporada", "inicio", "avance", "pleno", "final"];
function Hp() {
  const { t: f } = tt();
  return a.jsxs("div", {
    className: "legend",
    "aria-label": f("legend.title"),
    role: "group",
    children: [
      Zp.map((v) =>
        a.jsxs(
          "span",
          {
            className: "legend__item",
            children: [a.jsx(zr, { fase: v, size: v === "pleno" ? 18 : 16 }), f(`fase.short.${v}`)],
          },
          v,
        ),
      ),
      a.jsxs("span", {
        className: "legend__item",
        children: [
          a.jsx("span", { "aria-hidden": "true", className: "legend__ring" }),
          f("legend.certainty"),
        ],
      }),
    ],
  });
}
const Xd = { pleno: 0, avance: 1, inicio: 2, final: 3, fuera_temporada: 4 };
function $p({ fecha: f, onFecha: v, sel: m, onSel: j, onMethod: T, onAlert: S }) {
  const { t: M } = tt(),
    [b, C] = ce.useState(""),
    [O, ne] = ce.useState("all"),
    [J, ae] = ce.useState(!0),
    [me, Pe] = ce.useState(!1),
    [pe, Ee] = ce.useState(!1),
    [$e, ue] = ce.useState(!0),
    We = ce.useMemo(() => Ot.map((ht) => ({ d: ht, e: Cl(ht, f) })), [f]),
    at = ce.useMemo(() => {
      const ht = b.trim().toLowerCase();
      return We.filter(({ d: vt, e: Ct }) => {
        const ft = O === "all" || vt.tipo === O,
          Ke =
            !ht ||
            `${vt.nombre} ${vt.lugar} ${vt.provincia} ${vt.especie} ${vt.fenomeno}`
              .toLowerCase()
              .includes(ht);
        return ft && Ke && (J || Ct.fase !== "fuera_temporada");
      }).sort((vt, Ct) => Xd[vt.e.fase] - Xd[Ct.e.fase] || vt.d.nombre.localeCompare(Ct.d.nombre));
    }, [We, b, O, J]),
    yt = m ? We.find((ht) => ht.d.id === m) : void 0,
    qe = f > qt,
    Be = We.filter((ht) => ht.e.fase !== "fuera_temporada").length;
  return a.jsx("section", {
    id: "mapa",
    className: "map-section",
    "aria-labelledby": "map-title",
    children: a.jsxs("div", {
      className: "container",
      children: [
        a.jsxs("div", {
          className: "section-head",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx("h2", { id: "map-title", className: "h2", children: M("map.title") }),
                a.jsx("p", { className: "muted lead-sm", children: M("map.lead") }),
              ],
            }),
            a.jsx(Hp, {}),
          ],
        }),
        a.jsx(Ep, { fecha: f, onChange: v }),
        a.jsxs("div", {
          className: "map-layout",
          children: [
            a.jsx("div", {
              className: "panel",
              children: yt
                ? a.jsx(
                    Fp,
                    { d: yt.d, e: yt.e, fecha: f, onBack: () => j(null), onMethod: T, onAlert: S },
                    yt.d.id,
                  )
                : a.jsx(Bp, {
                    all: We,
                    visible: at,
                    fecha: f,
                    esPrevision: qe,
                    q: b,
                    onQ: C,
                    tipo: O,
                    onTipo: ne,
                    off: J,
                    onOff: ae,
                    onSelect: j,
                  }),
            }),
            a.jsxs("div", {
              className: "map-col",
              children: [
                a.jsx(Pp, {
                  items: at,
                  fecha: f,
                  esPrevision: qe,
                  activos: Be,
                  sel: m,
                  onSelect: j,
                  showZones: me,
                  showPhotos: pe,
                  showCities: $e,
                  onToggleCities: ue,
                  onToggleZones: Pe,
                  onTogglePhotos: Ee,
                }),
                a.jsx("p", { className: "map-footnote", children: M("map.footnote") }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function Wp({ open: f, onClose: v }) {
  const { t: m, list: j } = tt(),
    T = ce.useRef(null);
  ce.useEffect(() => {
    const b = T.current;
    b && (f && !b.open && b.showModal(), !f && b.open && b.close());
  }, [f]);
  const S = ["observado", "estimado", "previsto", "editorial"],
    M = ["alta", "media", "baja"];
  return a.jsx("dialog", {
    ref: T,
    className: "modal",
    "aria-labelledby": "method-title",
    onClose: v,
    onClick: (b) => {
      b.target === T.current && v();
    },
    children: a.jsxs("div", {
      className: "modal__inner",
      children: [
        a.jsxs("div", {
          className: "modal__head",
          children: [
            a.jsx("h2", { id: "method-title", className: "h2", children: m("method.title") }),
            a.jsx("button", {
              type: "button",
              className: "icon-btn",
              "aria-label": m("method.close"),
              onClick: v,
              children: a.jsx(He, { name: "x" }),
            }),
          ],
        }),
        a.jsxs("p", {
          className: "honesty",
          children: [a.jsx(He, { name: "satellite", size: 18 }), m("ficha.honesty")],
        }),
        a.jsx("h3", { className: "sub", children: m("method.sourcesT") }),
        a.jsx("ul", {
          className: "bullets",
          children: j("method.sources").map((b) => a.jsx("li", { children: b }, b)),
        }),
        a.jsx("h3", { className: "sub", children: m("method.stepsT") }),
        a.jsx("ol", {
          className: "steps",
          children: j("method.steps").map((b) => a.jsx("li", { children: b }, b)),
        }),
        a.jsx("h3", { className: "sub", children: m("method.freqT") }),
        a.jsx("p", { className: "prose", children: m("method.freq") }),
        a.jsx("h3", { className: "sub", children: m("method.confT") }),
        a.jsx("div", {
          className: "tag-row",
          children: M.map((b) => a.jsx(ps, { confianza: b }, b)),
        }),
        a.jsx("ul", {
          className: "bullets",
          children: j("method.conf").map((b) => a.jsx("li", { children: b }, b)),
        }),
        a.jsx("h3", { className: "sub", children: m("method.typesT") }),
        a.jsx("div", { className: "tag-row", children: S.map((b) => a.jsx(Mr, { tipo: b }, b)) }),
        a.jsx("h3", { className: "sub", children: m("method.limitsT") }),
        a.jsx("ul", {
          className: "bullets",
          children: j("method.limits").map((b) => a.jsx("li", { children: b }, b)),
        }),
      ],
    }),
  });
}
function Up({ fecha: f, onPick: v }) {
  const { t: m, lang: j } = tt(),
    T = Ot.filter((C) => Cl(C, f).fase !== "fuera_temporada").map((C) => C.id),
    S = Ot.slice()
      .sort((C, O) => ro(C).desde.localeCompare(ro(O).desde))
      .find((C) => ro(C).hasta >= f),
    M = T.length ? T : S ? [S.id] : [],
    b = wa
      .filter((C) => M.includes(C.destinoId))
      .sort((C, O) => Number(O.patrocinado) - Number(C.patrocinado))
      .slice(0, 6);
  return a.jsx("section", {
    id: "planes",
    className: "plans",
    "aria-labelledby": "plans-title",
    children: a.jsxs("div", {
      className: "container",
      children: [
        a.jsxs("div", {
          className: "section-head",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx(Tl, { children: m("plans.eyebrow") }),
                a.jsx("h2", {
                  id: "plans-title",
                  className: "h2",
                  children: m("plans.title", { fecha: un(f, j, !0) }),
                }),
                a.jsx("p", {
                  className: "muted lead-sm",
                  children: T.length ? m("plans.lead") : m("plans.leadNone"),
                }),
              ],
            }),
            a.jsx($s, {
              capa: "comercial",
              children: a.jsx("span", { className: "small muted", children: m("ficha.neutral") }),
            }),
          ],
        }),
        a.jsx("div", {
          className: "cards",
          children: b.map((C) => {
            const O = oo(C.destinoId),
              ne = Cl(O, f);
            return a.jsxs(
              "article",
              {
                className: "card",
                children: [
                  a.jsxs("div", {
                    className: "card__band",
                    style: { background: `color-mix(in srgb, ${O.color} 22%, #fff)` },
                    children: [
                      a.jsx(jh, { kind: O.ilustracion, size: 150, className: "card__art" }),
                      a.jsx("span", {
                        className: "card__pill",
                        children: a.jsx(Ku, { fase: ne.fase, tipo: O.tipo }),
                      }),
                      C.patrocinado &&
                        a.jsx("span", { className: "card__sponsor", children: a.jsx(Qu, {}) }),
                    ],
                  }),
                  a.jsxs("div", {
                    className: "card__body",
                    children: [
                      a.jsxs("p", {
                        className: "card__kicker",
                        children: [
                          a.jsx(He, {
                            name: C.tipo === "alojamiento" ? "bed" : "compass",
                            size: 16,
                          }),
                          C.tipo === "alojamiento" ? m("plans.stay") : m("plans.activity"),
                          " ·",
                          " ",
                          a.jsx("button", {
                            type: "button",
                            className: "link-button",
                            onClick: () => v(O.id),
                            children: O.nombre,
                          }),
                        ],
                      }),
                      a.jsx("h3", { className: "card__title", children: C.nombre }),
                      a.jsx("p", { className: "card__text", children: C.descripcion }),
                      a.jsxs("div", {
                        className: "card__foot",
                        children: [
                          a.jsxs("span", {
                            className: "small muted",
                            children: [
                              m("ficha.fromPrice"),
                              " ",
                              a.jsx("strong", { className: "price", children: C.precio }),
                            ],
                          }),
                          a.jsx("a", {
                            href: "#",
                            className: "btn btn--primary",
                            children: m("plans.view"),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              },
              C.id,
            );
          }),
        }),
      ],
    }),
  });
}

export { $p, Up, Wp };
