import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He, rh } from "./components/icons.js";
import { Sf, jl, kf, wa, wf } from "./data/ofertas.js";
import { Ho, Us, un, xa } from "./utils/fechas.js";
import { Ot, oo } from "./data/destinos.js";
import { $s, Mr, ps, zr } from "./components/ui.js";

const Hd = 7;
function Lf() {
  const { t: f, lang: v } = tt(),
    [m, j] = ce.useState(Ot[0].id),
    [T, S] = ce.useState(!1),
    M = oo(m),
    b = M.ventanas.find((O) => O.fase === "pleno"),
    C = wa.filter((O) => O.destinoId === m);
  return a.jsxs(a.Fragment, {
    children: [
      a.jsx("p", { className: "muted lead-sm", children: f("admin.alertsLead") }),
      a.jsx("div", {
        className: "table-wrap",
        children: a.jsxs("table", {
          className: "sources",
          children: [
            a.jsx("thead", {
              children: a.jsxs("tr", {
                children: [
                  a.jsx("th", { scope: "col", children: f("admin.colDest") }),
                  a.jsx("th", { scope: "col", children: f("admin.colPhase") }),
                  a.jsx("th", { scope: "col", children: f("admin.subs") }),
                  a.jsx("th", { scope: "col", children: f("admin.pendingOptIn") }),
                  a.jsx("th", { scope: "col", children: f("admin.nextSend") }),
                ],
              }),
            }),
            a.jsx("tbody", {
              children: Sf.map((O) => {
                const ne = oo(O.destinoId),
                  J = ne.ventanas.find((ae) => ae.fase === O.fase);
                return a.jsxs(
                  "tr",
                  {
                    children: [
                      a.jsx("th", { scope: "row", children: ne.nombre }),
                      a.jsx("td", { children: f(`fase.${ne.tipo}.${O.fase}`) }),
                      a.jsx("td", { className: "num", children: O.confirmadas.toLocaleString(v) }),
                      a.jsx("td", { className: "num", children: O.sinConfirmar.toLocaleString(v) }),
                      a.jsx("td", { children: un(Us(J.desde, -Hd), v, !0) }),
                    ],
                  },
                  O.destinoId + O.fase,
                );
              }),
            }),
          ],
        }),
      }),
      a.jsxs("div", {
        className: "admin-row",
        children: [
          a.jsxs("label", {
            className: "field field--light",
            children: [
              f("alerts.dest"),
              a.jsx("select", {
                id: "admin-alert-dest",
                value: m,
                onChange: (O) => {
                  (j(O.target.value), S(!1));
                },
                children: Ot.map((O) => a.jsx("option", { value: O.id, children: O.nombre }, O.id)),
              }),
            ],
          }),
          a.jsxs("button", {
            type: "button",
            className: "btn btn--primary",
            onClick: () => S(!0),
            children: [a.jsx(He, { name: "mail", size: 18 }), f("admin.test")],
          }),
        ],
      }),
      T &&
        a.jsxs("div", {
          className: "email-preview",
          role: "region",
          "aria-label": f("admin.preview"),
          children: [
            a.jsx("p", { className: "label", children: f("admin.preview") }),
            a.jsxs("div", {
              className: "email",
              children: [
                a.jsx("p", {
                  className: "email__subject",
                  children: f("alerts.previewSubject", {
                    fase: f(`fase.${M.tipo}.pleno`),
                    destino: M.nombre,
                    desde: un(b.desde, v),
                    hasta: un(b.hasta, v, !0),
                  }),
                }),
                a.jsx("p", {
                  children: f("alerts.previewBody", {
                    n: Hd,
                    conf: `${f(`confianza.${b.confianza}`)}, ${f("confianza.prob", { p: Math.round(b.probabilidad * 100) })}`,
                  }),
                }),
                a.jsx(ps, { confianza: b.confianza, probabilidad: b.probabilidad }),
                a.jsx("div", {
                  className: "email__links",
                  children: C.slice(0, 2).map((O) =>
                    a.jsxs(
                      "a",
                      {
                        href: "#admin",
                        className: "email__link",
                        children: [
                          a.jsx(He, {
                            name: O.tipo === "alojamiento" ? "bed" : "compass",
                            size: 16,
                          }),
                          O.tipo === "alojamiento"
                            ? f("alerts.previewStay")
                            : f("alerts.previewDo"),
                          ": ",
                          O.nombre,
                        ],
                      },
                      O.id,
                    ),
                  ),
                }),
                a.jsx("a", {
                  href: "#admin",
                  className: "small",
                  children: f("alerts.previewUnsub"),
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function Mf() {
  var b;
  const { t: f } = tt(),
    [v, m] = ce.useState(Ot[0].id),
    [j, T] = ce.useState(() => Object.fromEntries(wa.map((C) => [C.id, C.patrocinado]))),
    S = oo(v),
    M = wa.filter((C) => C.destinoId === v);
  return a.jsxs(a.Fragment, {
    children: [
      a.jsx("p", { className: "muted lead-sm", children: f("admin.contentLead") }),
      a.jsxs("label", {
        className: "field field--light admin-pick",
        children: [
          f("admin.pick"),
          a.jsx("select", {
            id: "content-dest",
            value: v,
            onChange: (C) => m(C.target.value),
            children: Ot.map((C) => a.jsx("option", { value: C.id, children: C.nombre }, C.id)),
          }),
        ],
      }),
      a.jsxs("div", {
        className: "admin-cols",
        children: [
          a.jsxs(
            "section",
            {
              className: "admin-card",
              children: [
                a.jsx($s, { capa: "editorial" }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.history"),
                    a.jsx("textarea", {
                      id: "content-history",
                      rows: 5,
                      defaultValue: S.editorial.historia,
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("ficha.see"),
                    a.jsx("textarea", {
                      id: "content-see",
                      rows: 4,
                      defaultValue: S.editorial.queVer.join(`
`),
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.access"),
                    a.jsx("textarea", {
                      id: "content-access",
                      rows: 3,
                      defaultValue: S.editorial.acceso,
                    }),
                  ],
                }),
              ],
            },
            `ed-${v}`,
          ),
          a.jsxs(
            "section",
            {
              className: "admin-card",
              children: [
                a.jsx($s, {
                  capa: "comercial",
                  children: a.jsx("span", {
                    className: "small muted",
                    children: f("ficha.neutral"),
                  }),
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.sponsorSlot"),
                    a.jsx("input", {
                      id: "content-sponsor",
                      defaultValue: ((b = S.patrocinio) == null ? void 0 : b.entidad) ?? "",
                      placeholder: f("admin.none"),
                    }),
                  ],
                }),
                a.jsx("p", { className: "sub", children: f("admin.offers") }),
                a.jsx("ul", {
                  className: "offer-admin",
                  children: M.map((C) =>
                    a.jsxs(
                      "li",
                      {
                        children: [
                          a.jsxs("span", {
                            children: [
                              a.jsx("span", { className: "sources__name", children: C.nombre }),
                              a.jsx("span", {
                                className: "small muted",
                                children:
                                  C.tipo === "alojamiento" ? f("plans.stay") : f("plans.activity"),
                              }),
                            ],
                          }),
                          a.jsxs("label", {
                            className: "check",
                            children: [
                              a.jsx("input", {
                                type: "checkbox",
                                checked: j[C.id],
                                onChange: (O) => T({ ...j, [C.id]: O.target.checked }),
                              }),
                              f("admin.sponsoredToggle"),
                            ],
                          }),
                        ],
                      },
                      C.id,
                    ),
                  ),
                }),
              ],
            },
            `co-${v}`,
          ),
        ],
      }),
    ],
  });
}
function zf() {
  const { t: f, lang: v } = tt(),
    [m, j] = ce.useState(kf),
    [T, S] = ce.useState(!1),
    M = () => {
      (S(!0),
        window.setTimeout(() => {
          const b = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
          (j((C) => [...C, { hora: b, nivel: "info", mensaje: f("data.ranOk") }]), S(!1));
        }, 1200));
    };
  return a.jsxs(a.Fragment, {
    children: [
      a.jsxs("div", {
        className: "admin-head",
        children: [
          a.jsx("p", { className: "muted lead-sm", children: f("data.lead") }),
          a.jsxs("button", {
            type: "button",
            className: "btn btn--ghost",
            onClick: M,
            disabled: T,
            "aria-busy": T,
            children: [
              a.jsx(He, { name: "refresh", size: 18, className: T ? "spin" : "" }),
              f(T ? "data.running" : "data.run"),
            ],
          }),
        ],
      }),
      a.jsxs("div", {
        className: "data-grid",
        children: [
          a.jsx("div", {
            className: "table-wrap",
            children: a.jsxs("table", {
              className: "sources",
              children: [
                a.jsx("thead", {
                  children: a.jsxs("tr", {
                    children: [
                      a.jsx("th", { scope: "col", children: f("data.source") }),
                      a.jsx("th", { scope: "col", children: f("data.last") }),
                      a.jsx("th", { scope: "col", children: f("data.status") }),
                    ],
                  }),
                }),
                a.jsx("tbody", {
                  children: wf.map((b) =>
                    a.jsxs(
                      "tr",
                      {
                        children: [
                          a.jsxs("th", {
                            scope: "row",
                            children: [
                              a.jsx("span", { className: "sources__name", children: b.nombre }),
                              a.jsx("span", { className: "small muted", children: b.detalle }),
                            ],
                          }),
                          a.jsx("td", { children: Ho(b.ultimaCarga, v) }),
                          a.jsx("td", {
                            children: a.jsxs("span", {
                              className: `status status--${b.estado}`,
                              children: [
                                a.jsx(He, { name: b.estado === "ok" ? "check" : "warn", size: 14 }),
                                b.estado === "ok"
                                  ? f("data.ok")
                                  : b.estado === "desactualizado"
                                    ? f("data.stale")
                                    : f("data.error"),
                              ],
                            }),
                          }),
                        ],
                      },
                      b.id,
                    ),
                  ),
                }),
              ],
            }),
          }),
          a.jsxs("div", {
            className: "log",
            children: [
              a.jsx("p", { className: "label", children: f("data.log") }),
              a.jsx("ol", {
                "aria-live": "polite",
                children: m.map((b, C) =>
                  a.jsxs(
                    "li",
                    {
                      className: `log__row log__row--${b.nivel}`,
                      children: [
                        a.jsx("time", { children: b.hora }),
                        a.jsx("span", { children: b.mensaje }),
                      ],
                    },
                    C,
                  ),
                ),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function bf() {
  const { t: f, lang: v } = tt(),
    [m, j] = ce.useState(() => Object.fromEntries(Ot.map((ne) => [ne.id, !0]))),
    [T, S] = ce.useState(!1),
    [M, b] = ce.useState(!1),
    C = (ne) => ne.toLocaleString(v, { minimumFractionDigits: 2 }),
    O = (ne) => {
      (ne.preventDefault(), b(!0));
    };
  return a.jsxs(a.Fragment, {
    children: [
      a.jsxs("div", {
        className: "admin-head",
        children: [
          a.jsx("p", { className: "muted lead-sm", children: f("admin.destLead") }),
          a.jsxs("button", {
            type: "button",
            className: "btn btn--primary",
            onClick: () => S(!0),
            "aria-expanded": T,
            children: [a.jsx(He, { name: "plus", size: 18 }), f("admin.add")],
          }),
        ],
      }),
      a.jsx("div", {
        className: "table-wrap",
        children: a.jsxs("table", {
          className: "sources",
          children: [
            a.jsx("thead", {
              children: a.jsxs("tr", {
                children: [
                  a.jsx("th", { scope: "col", children: f("admin.colDest") }),
                  a.jsx("th", { scope: "col", children: f("admin.coords") }),
                  a.jsx("th", { scope: "col", children: f("admin.thresholds") }),
                  a.jsx("th", { scope: "col", children: f("admin.sources") }),
                  a.jsx("th", { scope: "col", children: f("admin.active") }),
                ],
              }),
            }),
            a.jsx("tbody", {
              children: Ot.map((ne) =>
                a.jsxs(
                  "tr",
                  {
                    children: [
                      a.jsxs("th", {
                        scope: "row",
                        children: [
                          a.jsx("span", { className: "sources__name", children: ne.nombre }),
                          a.jsxs("span", {
                            className: "small muted",
                            children: [
                              ne.especie,
                              " · ",
                              ne.tipo === "floracion" ? f("map.bloom") : f("map.autumn"),
                            ],
                          }),
                        ],
                      }),
                      a.jsxs("td", {
                        className: "num",
                        children: [ne.lat.toFixed(3), ", ", ne.lon.toFixed(3)],
                      }),
                      a.jsxs("td", {
                        className: "num",
                        children: [
                          C(ne.umbrales.inicio),
                          " · ",
                          C(ne.umbrales.avance),
                          " · ",
                          C(ne.umbrales.pleno),
                        ],
                      }),
                      a.jsx("td", {
                        className: "small",
                        children: [...new Set(ne.ventanas.map((J) => J.fuente))].join(" · "),
                      }),
                      a.jsx("td", {
                        children: a.jsxs("label", {
                          className: "switch",
                          children: [
                            a.jsx("input", {
                              type: "checkbox",
                              checked: m[ne.id],
                              onChange: (J) => j({ ...m, [ne.id]: J.target.checked }),
                            }),
                            a.jsxs("span", {
                              className: "sr-only",
                              children: [f("admin.active"), ": ", ne.nombre],
                            }),
                          ],
                        }),
                      }),
                    ],
                  },
                  ne.id,
                ),
              ),
            }),
          ],
        }),
      }),
      T &&
        a.jsxs("form", {
          className: "admin-form",
          onSubmit: O,
          children: [
            a.jsx("h3", { className: "sub", children: f("admin.addTitle") }),
            a.jsxs("div", {
              className: "admin-form__grid",
              children: [
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.name"),
                    a.jsx("input", {
                      id: "new-name",
                      required: !0,
                      placeholder: "Azahar de Sevilla",
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.species"),
                    a.jsx("input", {
                      id: "new-species",
                      required: !0,
                      placeholder: "Naranjo amargo (Citrus × aurantium)",
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.type"),
                    a.jsxs("select", {
                      id: "new-type",
                      children: [
                        a.jsx("option", { value: "floracion", children: f("map.bloom") }),
                        a.jsx("option", { value: "color_otonal", children: f("map.autumn") }),
                      ],
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.lat"),
                    a.jsx("input", {
                      id: "new-lat",
                      type: "number",
                      step: "0.001",
                      required: !0,
                      placeholder: "37.389",
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.lon"),
                    a.jsx("input", {
                      id: "new-lon",
                      type: "number",
                      step: "0.001",
                      required: !0,
                      placeholder: "-5.984",
                    }),
                  ],
                }),
                a.jsxs("label", {
                  className: "field field--light",
                  children: [
                    f("admin.thresholds"),
                    a.jsx("input", { id: "new-thresholds", defaultValue: "0,15 · 0,40 · 0,70" }),
                  ],
                }),
              ],
            }),
            a.jsx("button", {
              type: "submit",
              className: "btn btn--primary",
              children: f("admin.save"),
            }),
            M &&
              a.jsxs("p", {
                role: "status",
                className: "notice notice--ok",
                children: [a.jsx(He, { name: "check", size: 18 }), f("admin.saved")],
              }),
          ],
        }),
    ],
  });
}
function If() {
  const { t: f, lang: v } = tt(),
    [m, j] = ce.useState(!1),
    T = Ot.filter((S) => S.comparativa);
  return a.jsxs(a.Fragment, {
    children: [
      a.jsxs("div", {
        className: "admin-head",
        children: [
          a.jsx("p", { className: "muted lead-sm", children: f("admin.forecastLead") }),
          a.jsxs("button", {
            type: "button",
            className: "btn btn--ghost",
            onClick: () => j(!0),
            children: [a.jsx(He, { name: "refresh", size: 18 }), f("admin.recalc")],
          }),
        ],
      }),
      m &&
        a.jsxs("p", {
          role: "status",
          className: "notice notice--ok",
          children: [
            a.jsx(He, { name: "check", size: 18 }),
            f("admin.recalcDone", { fecha: un(Ot[0].entradasHasta, v) }),
          ],
        }),
      a.jsx("div", {
        className: "table-wrap",
        children: a.jsxs("table", {
          className: "sources",
          children: [
            a.jsx("thead", {
              children: a.jsxs("tr", {
                children: [
                  a.jsx("th", { scope: "col", children: f("admin.colDest") }),
                  a.jsx("th", { scope: "col", children: f("admin.colPhase") }),
                  a.jsx("th", { scope: "col", children: f("admin.colRange") }),
                  a.jsx("th", { scope: "col", children: f("admin.colMethod") }),
                  a.jsx("th", { scope: "col", children: f("admin.colUntil") }),
                  a.jsx("th", { scope: "col", children: f("admin.colGen") }),
                ],
              }),
            }),
            a.jsx("tbody", {
              children: Ot.flatMap((S) =>
                S.ventanas
                  .filter((M) => M.fase === "pleno" || S.estado.fase === M.fase)
                  .map((M) =>
                    a.jsxs(
                      "tr",
                      {
                        children: [
                          a.jsx("th", { scope: "row", children: S.nombre }),
                          a.jsx("td", { children: f(`fase.${S.tipo}.${M.fase}`) }),
                          a.jsxs("td", {
                            children: [
                              a.jsx("span", {
                                className: "sources__name",
                                children: xa(M.desde, M.hasta, v, !0),
                              }),
                              a.jsxs("span", {
                                className: "phases__tags",
                                children: [
                                  a.jsx(Mr, { tipo: M.tipoDato }),
                                  a.jsx(ps, {
                                    confianza: M.confianza,
                                    probabilidad: M.probabilidad,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          a.jsx("td", { children: f(`admin.method.${M.metodo}`) }),
                          a.jsx("td", { children: un(S.entradasHasta, v) }),
                          a.jsx("td", { children: Ho(S.generadaEn, v) }),
                        ],
                      },
                      S.id + M.fase,
                    ),
                  ),
              ),
            }),
          ],
        }),
      }),
      T.map((S) => {
        const M = S.comparativa;
        return a.jsxs(
          "section",
          {
            className: "compare compare--admin",
            children: [
              a.jsxs("h3", {
                className: "sub",
                children: [
                  f("admin.validation"),
                  " · ",
                  S.nombre,
                  " · ",
                  f(`fase.${S.tipo}.${M.fase}`),
                ],
              }),
              a.jsxs("dl", {
                children: [
                  a.jsxs("div", {
                    children: [
                      a.jsx("dt", { children: f("ficha.compareProvided") }),
                      a.jsx("dd", {
                        children: xa(M.proporcionada.desde, M.proporcionada.hasta, v),
                      }),
                    ],
                  }),
                  a.jsxs("div", {
                    children: [
                      a.jsx("dt", { children: f("ficha.compareOwn") }),
                      a.jsxs("dd", {
                        children: [
                          xa(M.propia.desde, M.propia.hasta, v),
                          " · ",
                          Math.round(M.propia.probabilidad * 100),
                          " %",
                        ],
                      }),
                    ],
                  }),
                  a.jsxs("div", {
                    children: [
                      a.jsx("dt", { children: f("ficha.compareMae") }),
                      a.jsx("dd", {
                        children: f("ficha.compareMaeVal", { n: M.maeDias.toLocaleString(v) }),
                      }),
                    ],
                  }),
                  a.jsxs("div", {
                    children: [
                      a.jsx("dt", { children: f("ficha.compareCoverage") }),
                      a.jsxs("dd", { children: [Math.round(M.cobertura * 100), " %"] }),
                    ],
                  }),
                ],
              }),
              a.jsxs("p", {
                className: "compare__why",
                children: [
                  a.jsxs("strong", { children: [f("ficha.compareWhy"), ":"] }),
                  " ",
                  M.explicacion,
                ],
              }),
            ],
          },
          S.id,
        );
      }),
    ],
  });
}
function Of() {
  const { t: f, lang: v } = tt(),
    [m, j] = ce.useState(() => Object.fromEntries(jl.map((M) => [M.id, M.estado]))),
    T = { pendiente: 0, rechazada: 1, valida: 2 },
    S = jl.slice().sort((M, b) => T[m[M.id]] - T[m[b.id]]);
  return a.jsxs(a.Fragment, {
    children: [
      a.jsx("p", { className: "muted lead-sm", children: f("admin.photosLead") }),
      a.jsx("ul", {
        className: "mod-list",
        children: S.map((M) => {
          const b = oo(M.destinoId),
            C = m[M.id],
            O = M.distanciaKm > 3,
            ne = M.horas > 72;
          return a.jsxs(
            "li",
            {
              className: `mod mod--${C}`,
              children: [
                a.jsx("span", {
                  className: "mod__thumb",
                  style: { background: b.color },
                  "aria-hidden": "true",
                  children: a.jsx(He, { name: "camera" }),
                }),
                a.jsxs("div", {
                  className: "mod__body",
                  children: [
                    a.jsxs("p", {
                      className: "mod__title",
                      children: [b.nombre, " · ", Ho(M.capturadaEn, v)],
                    }),
                    a.jsxs("p", {
                      className: "small muted mod__phase",
                      children: [
                        a.jsx(zr, { fase: M.faseReportada, size: 14 }),
                        f("admin.reported", { fase: f(`fase.${b.tipo}.${M.faseReportada}`) }),
                      ],
                    }),
                    a.jsxs("ul", {
                      className: "checks-inline",
                      "aria-label": f("admin.autoChecks"),
                      children: [
                        a.jsxs("li", {
                          className: O ? "is-bad" : "is-ok",
                          children: [
                            a.jsx(He, { name: O ? "x" : "check", size: 14 }),
                            f("admin.distance", {
                              n: M.distanciaKm.toLocaleString(v),
                              zona: M.zona,
                            }),
                          ],
                        }),
                        a.jsxs("li", {
                          className: ne ? "is-bad" : "is-ok",
                          children: [
                            a.jsx(He, { name: ne ? "x" : "check", size: 14 }),
                            f("admin.age", { n: M.horas }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                a.jsxs("div", {
                  className: "mod__actions",
                  children: [
                    a.jsxs("span", {
                      className: `status status--${C === "valida" ? "ok" : C === "pendiente" ? "desactualizado" : "error"}`,
                      children: [
                        f(
                          C === "valida"
                            ? "admin.valid"
                            : C === "pendiente"
                              ? "admin.pending"
                              : "admin.rejected",
                        ),
                        C === "rechazada" &&
                          M.motivo &&
                          ` · ${M.motivo === "lejos" ? f("admin.farReason") : f("admin.oldReason")}`,
                      ],
                    }),
                    C === "pendiente" &&
                      a.jsxs("span", {
                        className: "btn-row",
                        children: [
                          a.jsx("button", {
                            type: "button",
                            className: "btn btn--primary btn--sm",
                            onClick: () => j({ ...m, [M.id]: "valida" }),
                            children: f("admin.approve"),
                          }),
                          a.jsx("button", {
                            type: "button",
                            className: "btn btn--ghost btn--sm",
                            onClick: () => j({ ...m, [M.id]: "rechazada" }),
                            children: f("admin.reject"),
                          }),
                        ],
                      }),
                  ],
                }),
              ],
            },
            M.id,
          );
        }),
      }),
    ],
  });
}
const $d = [
  { id: "data", key: "admin.secData", icon: "database", render: () => a.jsx(zf, {}) },
  { id: "forecast", key: "admin.secForecast", icon: "calc", render: () => a.jsx(If, {}) },
  { id: "photos", key: "admin.secPhotos", icon: "camera", render: () => a.jsx(Of, {}) },
  { id: "alerts", key: "admin.secAlerts", icon: "bell", render: () => a.jsx(Lf, {}) },
  { id: "dest", key: "admin.secDest", icon: "pin", render: () => a.jsx(bf, {}) },
  { id: "content", key: "admin.secContent", icon: "book", render: () => a.jsx(Mf, {}) },
];
function Rf() {
  const { t: f, lang: v, setLang: m } = tt(),
    [j, T] = ce.useState("data"),
    S = $d.find((b) => b.id === j),
    M = ["es", "en"];
  return a.jsxs("div", {
    className: "admin",
    children: [
      a.jsxs("p", {
        className: "mock-banner",
        children: [a.jsx(He, { name: "info", size: 16 }), f("admin.note")],
      }),
      a.jsxs("header", {
        className: "admin-bar",
        children: [
          a.jsxs("div", {
            className: "admin-bar__brand",
            children: [
              a.jsx(rh, { size: 28 }),
              a.jsx("span", { className: "brand__name", children: f("brand") }),
              a.jsx("span", { className: "admin-bar__badge", children: f("admin.title") }),
              a.jsx("span", { className: "admin-bar__sub", children: f("admin.badge") }),
            ],
          }),
          a.jsxs("div", {
            className: "admin-bar__end",
            children: [
              a.jsx("div", {
                className: "lang lang--inverse",
                role: "group",
                "aria-label": f("nav.lang"),
                children: M.map((b) =>
                  a.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-pressed": v === b,
                      onClick: () => m(b),
                      children: b.toUpperCase(),
                    },
                    b,
                  ),
                ),
              }),
              a.jsxs("a", {
                href: "#top",
                className: "btn btn--outline-inverse btn--sm",
                children: [a.jsx(He, { name: "chevronLeft", size: 16 }), f("admin.back")],
              }),
            ],
          }),
        ],
      }),
      a.jsxs("div", {
        className: "admin-layout",
        children: [
          a.jsx("nav", {
            "aria-label": f("admin.nav"),
            className: "admin-nav",
            children: $d.map((b) =>
              a.jsxs(
                "button",
                {
                  type: "button",
                  "aria-current": j === b.id ? "page" : void 0,
                  onClick: () => T(b.id),
                  children: [a.jsx(He, { name: b.icon, size: 18 }), f(b.key)],
                },
                b.id,
              ),
            ),
          }),
          a.jsxs("main", {
            className: "admin-main",
            children: [a.jsx("h1", { className: "h2", children: f(S.key) }), S.render()],
          }),
        ],
      }),
    ],
  });
}

export { Rf };
