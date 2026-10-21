import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He } from "./components/icons.js";
import { El, sh } from "./utils/fechas.js";
import { Ot } from "./data/destinos.js";
import { Ku, Mr, ps, zr } from "./components/ui.js";
import { Cl, qt } from "./utils/fases.js";
import { Ep, Pp } from "./map/map.js";
import { Fp } from "./ficha.js";
import { aforo, conPanel } from "./data/pueblos.js";

const Yd = (f) => f.e.fase !== "fuera_temporada",
  fasesFiltro = ["inicio", "avance", "pleno", "final"],
  regiones = [...new Set(Ot.map((f) => f.region))].sort((f, v) => f.localeCompare(v)),
  especies = [...new Map(Ot.map((f) => [f.ilustracion, f.especie.split(" (")[0]])).entries()],
  filtrosBase = { tipo: "all", fases: [], region: "", especie: "", reales: !1, off: !0, orden: "fase" },
  nFiltros = (f) =>
    (f.tipo !== "all") + f.fases.length + !!f.region + !!f.especie + f.reales + !f.off + (f.orden !== "fase");
function Bp(f) {
  const { t: v, lang: m } = tt(),
    j = f.all.filter(Yd).length,
    T = [
      { id: "all", label: v("map.all") },
      { id: "floracion", label: v("map.bloom") },
      { id: "color_otonal", label: v("map.autumn") },
    ],
    F = f.flt,
    set = (k, x) => f.onFlt({ ...F, [k]: x }),
    n = nFiltros(F),
    [abierto, setAbierto] = ce.useState(!1);
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
                className: "muted small",
                children: v("map.summary", { active: j, off: f.all.length - j }),
              }),
            ],
          }),
          a.jsxs("div", {
            className: "filters__bar",
            children: [
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
              a.jsxs("button", {
                type: "button",
                className: "filters__toggle",
                "aria-expanded": abierto,
                "aria-controls": "map-filters",
                onClick: () => setAbierto((S) => !S),
                children: [
                  a.jsx(He, { name: "layers", size: 18 }),
                  v("map.filters"),
                  n > 0 && a.jsx("span", { className: "chip__count", children: n }),
                ],
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
                  "aria-pressed": F.tipo === S.id,
                  onClick: () => set("tipo", S.id),
                  children: [S.label, " ", a.jsx("span", { className: "chip__count", children: M })],
                },
                S.id,
              );
            }),
          }),
          abierto &&
            a.jsxs("div", {
              id: "map-filters",
              className: "filters",
              children: [
                a.jsxs("fieldset", {
                  className: "filters__group",
                  children: [
                    a.jsx("legend", { className: "filters__legend", children: v("map.phase") }),
                    a.jsx("div", {
                      className: "chips",
                      children: fasesFiltro.map((S) =>
                        a.jsxs(
                          "button",
                          {
                            type: "button",
                            className: "chip",
                            "aria-pressed": F.fases.includes(S),
                            onClick: () =>
                              set("fases", F.fases.includes(S) ? F.fases.filter((M) => M !== S) : [...F.fases, S]),
                            children: [a.jsx(zr, { fase: S, size: 14 }), v(`fase.short.${S}`)],
                          },
                          S,
                        ),
                      ),
                    }),
                  ],
                }),
                a.jsxs("div", {
                  className: "filters__row",
                  children: [
                    a.jsxs("label", {
                      className: "filters__field",
                      children: [
                        v("map.region"),
                        a.jsxs("select", {
                          value: F.region,
                          onChange: (S) => set("region", S.target.value),
                          children: [
                            a.jsx("option", { value: "", children: v("map.anyRegion") }),
                            regiones.map((S) => a.jsx("option", { value: S, children: S }, S)),
                          ],
                        }),
                      ],
                    }),
                    a.jsxs("label", {
                      className: "filters__field",
                      children: [
                        v("map.species"),
                        a.jsxs("select", {
                          value: F.especie,
                          onChange: (S) => set("especie", S.target.value),
                          children: [
                            a.jsx("option", { value: "", children: v("map.anySpecies") }),
                            especies.map(([S, M]) => a.jsx("option", { value: S, children: M }, S)),
                          ],
                        }),
                      ],
                    }),
                    a.jsxs("label", {
                      className: "filters__field",
                      children: [
                        v("map.sort"),
                        a.jsx("select", {
                          value: F.orden,
                          onChange: (S) => set("orden", S.target.value),
                          children: ["fase", "next", "name"].map((S) =>
                            a.jsx(
                              "option",
                              {
                                value: S,
                                children: v(S === "fase" ? "map.sortPhase" : S === "next" ? "map.sortNext" : "map.sortName"),
                              },
                              S,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                a.jsxs("div", {
                  className: "filters__row",
                  children: [
                    a.jsxs("label", {
                      className: "check",
                      children: [
                        a.jsx("input", { type: "checkbox", checked: F.reales, onChange: (S) => set("reales", S.target.checked) }),
                        v("map.realOnly"),
                      ],
                    }),
                    a.jsxs("label", {
                      className: "check",
                      children: [
                        a.jsx("input", { type: "checkbox", checked: F.off, onChange: (S) => set("off", S.target.checked) }),
                        v("map.showOff"),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          a.jsxs("div", {
            className: "filters__summary",
            children: [
              a.jsx("span", {
                className: "small muted",
                role: "status",
                children: v("map.results", { n: f.visible.length, total: f.all.length }),
              }),
              (n > 0 || f.q) &&
                a.jsx("button", {
                  type: "button",
                  className: "link-button small",
                  onClick: () => (f.onFlt(filtrosBase), f.onQ("")),
                  children: v("map.clear"),
                }),
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
                          conPanel.includes(S.id) &&
                            ((A) =>
                              A.completo &&
                              a.jsx("span", {
                                className: "pill pill--aforo",
                                children: v(A.completo.motivo === "pausa" ? "aforo.badgePaused" : "aforo.badge"),
                              }))(aforo(S.id)),
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
    [F, setF] = ce.useState(filtrosBase),
    [me, Pe] = ce.useState(!1),
    [pe, Ee] = ce.useState(!1),
    [$e, ue] = ce.useState(!0),
    We = ce.useMemo(() => Ot.map((ht) => ({ d: ht, e: Cl(ht, f) })), [f]),
    at = ce.useMemo(() => {
      const ht = b.trim().toLowerCase();
      const prox = (x) => (x.e.fase !== "fuera_temporada" ? "" : x.e.siguiente ? x.e.siguiente.desde : "9999"),
        orden = {
          fase: (vt, Ct) => Xd[vt.e.fase] - Xd[Ct.e.fase] || vt.d.nombre.localeCompare(Ct.d.nombre),
          next: (vt, Ct) => prox(vt).localeCompare(prox(Ct)) || Xd[vt.e.fase] - Xd[Ct.e.fase],
          name: (vt, Ct) => vt.d.nombre.localeCompare(Ct.d.nombre),
        }[F.orden];
      return We.filter(({ d: vt, e: Ct }) => {
        const ft = F.tipo === "all" || vt.tipo === F.tipo,
          Ke =
            !ht ||
            `${vt.nombre} ${vt.lugar} ${vt.provincia} ${vt.region} ${vt.especie} ${vt.fenomeno}`
              .toLowerCase()
              .includes(ht);
        return (
          ft &&
          Ke &&
          (F.off || Ct.fase !== "fuera_temporada") &&
          (!F.fases.length || F.fases.includes(Ct.fase)) &&
          (!F.region || vt.region === F.region) &&
          (!F.especie || vt.ilustracion === F.especie) &&
          (!F.reales || vt.datosReales)
        );
      }).sort(orden);
    }, [We, b, F]),
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
                    flt: F,
                    onFlt: setF,
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
export { $p, Wp };
