import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He } from "./components/icons.js";
import { jl, wa } from "./data/ofertas.js";
import { Bo, El, Ho, ah, jf, lh, un, xa } from "./utils/fechas.js";
import { $s, Ku, Mr, Qu, ps, zr } from "./components/ui.js";
import { fh, ph, qt, ro } from "./utils/fases.js";
import { jh } from "./components/ilustraciones.js";

function Qd({ o: f }) {
  const { t: v } = tt();
  return a.jsxs("li", {
    className: "offer",
    children: [
      a.jsx("span", {
        className: "offer__icon",
        "aria-hidden": "true",
        children: a.jsx(He, { name: f.tipo === "alojamiento" ? "bed" : "compass" }),
      }),
      a.jsxs("span", {
        className: "offer__text",
        children: [
          a.jsxs("span", {
            className: "offer__name",
            children: [f.nombre, f.patrocinado && a.jsx(Qu, {})],
          }),
          a.jsx("span", { className: "small muted", children: f.descripcion }),
          a.jsx("span", {
            className: "small muted",
            children: f.distanciaKm === 0 ? v("ficha.onSite") : v("ficha.km", { n: f.distanciaKm }),
          }),
        ],
      }),
      a.jsxs("span", {
        className: "offer__end",
        children: [
          a.jsxs("span", {
            className: "small muted",
            children: [
              v("ficha.fromPrice"),
              " ",
              a.jsx("strong", { className: "price", children: f.precio }),
            ],
          }),
          a.jsx("a", { href: "#", className: "btn btn--ghost btn--sm", children: v("ficha.book") }),
        ],
      }),
    ],
  });
}
function bp({ d: f }) {
  const { t: v } = tt(),
    m = wa.filter((S) => S.destinoId === f.id),
    j = m.filter((S) => S.tipo === "alojamiento"),
    T = m.filter((S) => S.tipo === "actividad");
  return a.jsxs("div", {
    className: "ficha-body",
    children: [
      a.jsx($s, {
        capa: "comercial",
        children: a.jsx("span", { className: "small muted", children: v("ficha.neutral") }),
      }),
      m.length === 0 && a.jsx("p", { className: "empty", children: v("ficha.nothing") }),
      j.length > 0 &&
        a.jsxs("section", {
          children: [
            a.jsx("h4", { className: "sub", children: v("ficha.stayTitle") }),
            a.jsx("ul", { className: "offers", children: j.map((S) => a.jsx(Qd, { o: S }, S.id)) }),
          ],
        }),
      T.length > 0 &&
        a.jsxs("section", {
          children: [
            a.jsx("h4", { className: "sub", children: v("ficha.doTitle") }),
            a.jsx("ul", { className: "offers", children: T.map((S) => a.jsx(Qd, { o: S }, S.id)) }),
          ],
        }),
    ],
  });
}
const fs = 360,
  dt = { l: 30, r: 10, t: 10, b: 24 };
function Ip({ serie: f, prevision: v, umbrales: m }) {
  var $e;
  const { t: j, lang: T } = tt(),
    S = 190,
    M = f[0].fecha,
    b = v[v.length - 1].fecha,
    C = Bo(b, M),
    O = (ue) => dt.l + (Bo(ue, M) / C) * (fs - dt.l - dt.r),
    ne = (ue) => dt.t + (1 - ue) * (S - dt.t - dt.b),
    J = [];
  let ae = "";
  for (const ue of f)
    ue.indice === null
      ? (ae && J.push(ae), (ae = ""))
      : (ae += `${ae ? "L" : "M"}${O(ue.fecha).toFixed(1)} ${ne(ue.indice).toFixed(1)} `);
  ae && J.push(ae);
  const me =
      v
        .map((ue, We) => `${We ? "L" : "M"}${O(ue.fecha).toFixed(1)} ${ne(ue.p90).toFixed(1)}`)
        .join(" ") +
      " " +
      v
        .slice()
        .reverse()
        .map((ue) => `L${O(ue.fecha).toFixed(1)} ${ne(ue.p10).toFixed(1)}`)
        .join(" ") +
      " Z",
    Pe = v
      .map((ue, We) => `${We ? "L" : "M"}${O(ue.fecha).toFixed(1)} ${ne(ue.p50).toFixed(1)}`)
      .join(" "),
    pe = f
      .filter((ue) => ue.fecha.endsWith("-01") || ue.fecha.endsWith("-15"))
      .map((ue) => ue.fecha);
  pe.includes(v[v.length - 1].fecha) ||
    pe.push((($e = v.find((ue) => ue.fecha.endsWith("-01"))) == null ? void 0 : $e.fecha) ?? b);
  const Ee = ["inicio", "avance", "pleno"];
  return a.jsxs("figure", {
    className: "chart",
    children: [
      a.jsxs("svg", {
        viewBox: `0 0 ${fs} ${S}`,
        role: "img",
        "aria-label": `${j("ficha.chartIndex")}. ${j("ficha.chartIndexDesc")}`,
        children: [
          [0, 0.5, 1].map((ue) =>
            a.jsxs(
              "g",
              {
                children: [
                  a.jsx("line", {
                    x1: dt.l,
                    x2: fs - dt.r,
                    y1: ne(ue),
                    y2: ne(ue),
                    className: "chart__grid",
                  }),
                  a.jsx("text", {
                    x: dt.l - 6,
                    y: ne(ue) + 4,
                    className: "chart__axis",
                    textAnchor: "end",
                    children: ue.toLocaleString(T),
                  }),
                ],
              },
              ue,
            ),
          ),
          Ee.map((ue) =>
            a.jsxs(
              "g",
              {
                children: [
                  a.jsx("line", {
                    x1: dt.l,
                    x2: fs - dt.r,
                    y1: ne(m[ue]),
                    y2: ne(m[ue]),
                    className: "chart__threshold",
                  }),
                  a.jsx("text", {
                    x: dt.l + 4,
                    y: ne(m[ue]) - 3,
                    className: "chart__th-label",
                    children: j(`fase.short.${ue}`),
                  }),
                ],
              },
              ue,
            ),
          ),
          a.jsx("path", { d: me, className: "chart__band" }),
          a.jsx("path", { d: Pe, className: "chart__median" }),
          J.map((ue, We) => a.jsx("path", { d: ue, className: "chart__line" }, We)),
          f
            .filter((ue) => ue.indice === null)
            .map((ue) =>
              a.jsxs(
                "g",
                {
                  className: "chart__gap",
                  children: [
                    a.jsx("rect", {
                      x: O(ue.fecha) - 2.5,
                      y: dt.t,
                      width: 5,
                      height: S - dt.t - dt.b,
                    }),
                    a.jsx("text", {
                      x: O(ue.fecha),
                      y: S - dt.b - 4,
                      textAnchor: "middle",
                      children: "×",
                    }),
                  ],
                },
                ue.fecha,
              ),
            ),
          a.jsx("line", {
            x1: O(qt),
            x2: O(qt),
            y1: dt.t,
            y2: S - dt.b,
            className: "chart__today",
          }),
          a.jsx("text", {
            x: O(qt) + 3,
            y: dt.t + 9,
            className: "chart__today-label",
            children: j("map.today"),
          }),
          pe.map((ue) =>
            a.jsx(
              "text",
              {
                x: O(ue),
                y: S - 6,
                className: "chart__axis",
                textAnchor: "middle",
                children: un(ue, T),
              },
              ue,
            ),
          ),
        ],
      }),
      a.jsxs("figcaption", {
        className: "chart__legend",
        children: [
          a.jsxs("span", {
            children: [a.jsx("i", { className: "key key--line" }), j("ficha.chartObserved")],
          }),
          a.jsxs("span", {
            children: [a.jsx("i", { className: "key key--gap" }), j("ficha.chartNoData")],
          }),
          a.jsxs("span", {
            children: [a.jsx("i", { className: "key key--band" }), j("ficha.chartBand")],
          }),
          a.jsxs("span", {
            children: [a.jsx("i", { className: "key key--threshold" }), j("ficha.chartThreshold")],
          }),
        ],
      }),
    ],
  });
}
function Op({ serie: f }) {
  const { t: v, lang: m } = tt(),
    j = 120,
    T = f.map((C) => C.tMax ?? 0),
    S = Math.ceil(Math.max(...T) / 5) * 5,
    M = (fs - dt.l - dt.r) / f.length,
    b = (C) => dt.t + (1 - C / S) * (j - dt.t - dt.b);
  return a.jsx("figure", {
    className: "chart",
    children: a.jsxs("svg", {
      viewBox: `0 0 ${fs} ${j}`,
      role: "img",
      "aria-label": `${v("ficha.chartTemp")}. ${v("ficha.chartTempDesc")}`,
      children: [
        [0, S / 2, S].map((C) =>
          a.jsxs(
            "g",
            {
              children: [
                a.jsx("line", {
                  x1: dt.l,
                  x2: fs - dt.r,
                  y1: b(C),
                  y2: b(C),
                  className: "chart__grid",
                }),
                a.jsxs("text", {
                  x: dt.l - 6,
                  y: b(C) + 4,
                  className: "chart__axis",
                  textAnchor: "end",
                  children: [C, "°"],
                }),
              ],
            },
            C,
          ),
        ),
        f.map((C, O) =>
          C.tMax === null
            ? null
            : a.jsx(
                "rect",
                {
                  x: dt.l + O * M + 0.5,
                  y: b(C.tMax),
                  width: Math.max(1, M - 1),
                  height: j - dt.b - b(C.tMax),
                  className: "chart__bar",
                },
                C.fecha,
              ),
        ),
        [f[0], f[Math.floor(f.length / 2)], f[f.length - 1]].map((C) =>
          a.jsx(
            "text",
            {
              x: dt.l + f.indexOf(C) * M + M / 2,
              y: j - 6,
              className: "chart__axis",
              textAnchor: "middle",
              children: un(C.fecha, m),
            },
            C.fecha,
          ),
        ),
      ],
    }),
  });
}
function Rp({ hist: f, ventana: v }) {
  const { lang: m } = tt(),
    j = f.reduce((b, C) => (C.desde < b ? C.desde : b), f[0].desde),
    T = f.reduce((b, C) => (C.hasta > b ? C.hasta : b), f[0].hasta),
    S = Bo(T, j) || 1,
    M = (b) => (Bo(b, j) / S) * 100;
  return a.jsx("ol", {
    className: "margin",
    children: f.map((b, C) => {
      const O = C === f.length - 1;
      return a.jsxs(
        "li",
        {
          className: O ? "is-current" : "",
          children: [
            a.jsx("span", { className: "margin__when", children: un(b.generadaEn, m) }),
            a.jsx("span", {
              className: "margin__track",
              children: a.jsx("span", {
                className: "margin__bar",
                style: { left: `${M(b.desde)}%`, width: `${M(b.hasta) - M(b.desde)}%` },
              }),
            }),
            a.jsxs("span", {
              className: "margin__range",
              children: [
                Bo(b.hasta, b.desde),
                " d",
                O ? ` · ${Math.round(v.probabilidad * 100)} %` : "",
              ],
            }),
          ],
        },
        b.generadaEn,
      );
    }),
  });
}
function Dp({ d: f, onMethod: v, onAlert: m }) {
  const { t: j, lang: T } = tt(),
    S = ro(f),
    M = jl.filter((C) => C.destinoId === f.id),
    b = Array.from({ length: 12 }, (C, O) => lh(ah(qt), O));
  return a.jsxs("div", {
    className: "ficha-body",
    children: [
      a.jsx($s, { capa: "calculada" }),
      a.jsxs("div", {
        className: "best",
        children: [
          a.jsx("p", { className: "label", children: j("ficha.bestTime") }),
          a.jsx("p", {
            className: "best__range",
            children: j("ficha.bestRange", {
              fase: j(`fase.${f.tipo}.pleno`),
              desde: un(S.desde, T),
              hasta: un(S.hasta, T, !0),
            }),
          }),
          a.jsxs("div", {
            className: "best__meta",
            children: [
              a.jsx(ps, { confianza: S.confianza, probabilidad: S.probabilidad }),
              a.jsx(Mr, { tipo: S.tipoDato }),
            ],
          }),
          a.jsxs("p", {
            className: "small muted",
            children: [
              j("ficha.basedOn", { hasta: un(f.entradasHasta, T), gen: Ho(f.generadaEn, T) }),
              " · ",
              j("ficha.source", { fuente: S.fuente }),
            ],
          }),
        ],
      }),
      a.jsxs("p", {
        className: "honesty",
        children: [
          a.jsx(He, { name: "satellite", size: 18 }),
          a.jsxs("span", {
            children: [
              j("ficha.honesty"),
              " ",
              a.jsx("button", {
                type: "button",
                className: "link-button",
                onClick: v,
                children: j("ficha.honestyLink"),
              }),
            ],
          }),
        ],
      }),
      a.jsxs("section", {
        children: [
          a.jsx("h4", { className: "sub", children: j("ficha.phases") }),
          a.jsxs("table", {
            className: "phases",
            children: [
              a.jsx("thead", {
                children: a.jsxs("tr", {
                  children: [
                    a.jsx("th", { scope: "col", children: j("ficha.colPhase") }),
                    a.jsx("th", { scope: "col", children: j("ficha.colThisYear") }),
                    a.jsx("th", { scope: "col", children: j("ficha.colUsual") }),
                  ],
                }),
              }),
              a.jsx("tbody", {
                children: fh.map((C) => {
                  const O = f.ventanas.find((Pe) => Pe.fase === C),
                    ne = f.habituales.find((Pe) => Pe.fase === C),
                    J = O.desde.slice(0, 4),
                    ae = Bo(O.desde, `${J}-${ne.tipica}`) + Math.round(Bo(O.hasta, O.desde) / 2),
                    me = f.estado.fase === C;
                  return a.jsxs(
                    "tr",
                    {
                      className: me ? "is-now" : "",
                      children: [
                        a.jsx("th", {
                          scope: "row",
                          children: a.jsxs("span", {
                            className: "phases__fase",
                            children: [a.jsx(zr, { fase: C, size: 16 }), j(`fase.${f.tipo}.${C}`)],
                          }),
                        }),
                        a.jsxs("td", {
                          children: [
                            a.jsx("strong", {
                              children:
                                O.desde === O.hasta ? un(O.desde, T) : xa(O.desde, O.hasta, T),
                            }),
                            a.jsxs("span", {
                              className: "phases__tags",
                              children: [
                                a.jsx(Mr, { tipo: O.tipoDato }),
                                O.tipoDato === "previsto" && a.jsx(ps, { confianza: O.confianza }),
                              ],
                            }),
                          ],
                        }),
                        a.jsxs("td", {
                          children: [
                            jf(ne.tipica, T),
                            a.jsx("span", {
                              className: "phases__delta",
                              children:
                                Math.abs(ae) <= 1
                                  ? j("ficha.onTime")
                                  : ae < 0
                                    ? j("ficha.earlier", { n: -ae })
                                    : j("ficha.later", { n: ae }),
                            }),
                          ],
                        }),
                      ],
                    },
                    C,
                  );
                }),
              }),
            ],
          }),
        ],
      }),
      a.jsxs("section", {
        children: [
          a.jsx("h4", { className: "sub", children: j("ficha.calendar") }),
          a.jsx("div", {
            className: "cal",
            role: "list",
            children: b.map((C) => {
              const O = ph(f, Number(C.slice(0, 4)), Number(C.slice(5, 7))),
                ne = El(C, T),
                J = j(O === 2 ? "ficha.calPeak" : O === 1 ? "ficha.calActive" : "ficha.calOff");
              return a.jsxs(
                "div",
                {
                  role: "listitem",
                  className: `cal__cell cal__cell--${O}`,
                  title: `${ne} ${C.slice(0, 4)}: ${J}`,
                  children: [
                    a.jsx("span", { "aria-hidden": "true", children: ne.charAt(0).toUpperCase() }),
                    a.jsxs("span", {
                      className: "sr-only",
                      children: [ne, " ", C.slice(0, 4), ": ", J],
                    }),
                  ],
                },
                C,
              );
            }),
          }),
          a.jsxs("p", {
            className: "cal__legend small muted",
            children: [
              a.jsxs("span", {
                children: [a.jsx("i", { className: "key key--peak" }), j("ficha.calPeak")],
              }),
              a.jsxs("span", {
                children: [a.jsx("i", { className: "key key--active" }), j("ficha.calActive")],
              }),
              a.jsxs("span", {
                children: [a.jsx("i", { className: "key key--off" }), j("ficha.calOff")],
              }),
            ],
          }),
        ],
      }),
      f.serie && f.serieprevision
        ? a.jsxs(a.Fragment, {
            children: [
              a.jsxs("section", {
                children: [
                  a.jsxs("div", {
                    className: "sub-row",
                    children: [
                      a.jsx("h4", { className: "sub", children: j("ficha.chartIndex") }),
                      a.jsx(Mr, { tipo: "estimado" }),
                    ],
                  }),
                  a.jsx("p", { className: "small muted", children: j("ficha.chartIndexDesc") }),
                  a.jsx(Ip, { serie: f.serie, prevision: f.serieprevision, umbrales: f.umbrales }),
                ],
              }),
              a.jsxs("section", {
                children: [
                  a.jsxs("div", {
                    className: "sub-row",
                    children: [
                      a.jsx("h4", { className: "sub", children: j("ficha.chartTemp") }),
                      a.jsx(Mr, { tipo: "observado" }),
                    ],
                  }),
                  a.jsx("p", { className: "small muted", children: j("ficha.chartTempDesc") }),
                  a.jsx(Op, { serie: f.serie }),
                ],
              }),
            ],
          })
        : a.jsxs("p", {
            className: "empty-box",
            children: [
              a.jsx(He, { name: "info", size: 18 }),
              j("ficha.serieEmpty", { temporada: f.temporada }),
            ],
          }),
      f.zonas &&
        a.jsxs("section", {
          children: [
            a.jsxs("div", {
              className: "sub-row",
              children: [
                a.jsx("h4", { className: "sub", children: j("ficha.zones") }),
                a.jsx(Mr, { tipo: "estimado" }),
              ],
            }),
            a.jsx("p", {
              className: "small muted",
              children: j("ficha.zonesDesc", { fecha: un(f.entradasHasta, T) }),
            }),
            a.jsx("ul", {
              className: "zones",
              children: f.zonas.map((C) =>
                a.jsxs(
                  "li",
                  {
                    className: C.indice === null ? "is-nodata" : "",
                    children: [
                      a.jsx("span", { className: "zones__name", children: C.nombre }),
                      a.jsx("span", {
                        className: "zones__track",
                        "aria-hidden": "true",
                        children:
                          C.indice !== null &&
                          a.jsx("span", {
                            className: "zones__bar",
                            style: { width: `${C.indice * 100}%` },
                          }),
                      }),
                      a.jsx("span", {
                        className: "zones__val",
                        children:
                          C.indice === null
                            ? a.jsxs(a.Fragment, {
                                children: [
                                  j("ficha.noData"),
                                  " ",
                                  a.jsxs("span", {
                                    className: "muted",
                                    children: ["(", j("ficha.clouds"), ")"],
                                  }),
                                ],
                              })
                            : a.jsxs(a.Fragment, {
                                children: [
                                  C.indice.toLocaleString(T, { minimumFractionDigits: 2 }),
                                  " · ",
                                  j(`fase.short.${C.fase}`),
                                ],
                              }),
                      }),
                    ],
                  },
                  C.id,
                ),
              ),
            }),
          ],
        }),
      f.historicoMargen &&
        a.jsxs("section", {
          children: [
            a.jsx("h4", { className: "sub", children: j("ficha.margin") }),
            a.jsx("p", { className: "small muted", children: j("ficha.marginDesc") }),
            a.jsx(Rp, { hist: f.historicoMargen, ventana: S }),
          ],
        }),
      M.length > 0 &&
        a.jsxs("section", {
          children: [
            a.jsx("h4", { className: "sub", children: j("ficha.photos") }),
            a.jsx("p", { className: "small muted", children: j("ficha.photosDesc") }),
            a.jsx("ul", {
              className: "photos",
              children: M.map((C) =>
                a.jsxs(
                  "li",
                  {
                    children: [
                      a.jsx("span", {
                        className: "photos__thumb",
                        style: { background: f.color },
                        "aria-hidden": "true",
                        children: a.jsx(He, { name: "camera" }),
                      }),
                      a.jsxs("span", {
                        children: [j(`fase.short.${C.faseReportada}`), " · ", Ho(C.capturadaEn, T)],
                      }),
                      a.jsx("span", {
                        className: `photos__state photos__state--${C.estado}`,
                        children:
                          C.estado === "valida" ? j("ficha.photoValid") : j("ficha.photoPending"),
                      }),
                    ],
                  },
                  C.id,
                ),
              ),
            }),
          ],
        }),
      a.jsx("div", {
        className: "btn-row",
        children: a.jsxs("button", {
          type: "button",
          className: "btn btn--primary grow",
          onClick: () => m(f.id),
          children: [a.jsx(He, { name: "bell", size: 18 }), j("ficha.alert")],
        }),
      }),
    ],
  });
}
function Ap({ d: f }) {
  const { t: v } = tt(),
    m = f.editorial;
  return a.jsxs("div", {
    className: "ficha-body ficha-body--editorial",
    children: [
      a.jsx($s, { capa: "editorial" }),
      a.jsxs("section", {
        children: [
          a.jsx("h4", { className: "sub", children: v("ficha.history") }),
          a.jsx("p", { className: "prose", children: m.historia }),
        ],
      }),
      a.jsxs("section", {
        children: [
          a.jsx("h4", { className: "sub", children: v("ficha.see") }),
          a.jsx("ul", {
            className: "bullets",
            children: m.queVer.map((j) => a.jsx("li", { children: j }, j)),
          }),
        ],
      }),
      a.jsxs("section", {
        children: [
          a.jsx("h4", { className: "sub", children: v("ficha.howToGet") }),
          a.jsx("p", { className: "prose", children: m.comoLlegar }),
        ],
      }),
      a.jsxs("section", {
        className: "notice notice--warn",
        children: [
          a.jsx(He, { name: "warn", size: 18 }),
          a.jsxs("div", {
            children: [
              a.jsx("h4", { className: "sub", children: v("ficha.access") }),
              a.jsx("p", { className: "prose", children: m.acceso }),
            ],
          }),
        ],
      }),
      a.jsxs("section", {
        children: [
          a.jsx("h4", { className: "sub", children: v("ficha.tips") }),
          a.jsx("ul", {
            className: "bullets",
            children: m.consejos.map((j) => a.jsx("li", { children: j }, j)),
          }),
        ],
      }),
      f.patrocinio &&
        a.jsxs("aside", {
          className: "sponsor-slot",
          "aria-label": v("ficha.sponsoredBy", { entidad: f.patrocinio.entidad }),
          children: [
            a.jsx(Qu, {}),
            a.jsx("p", {
              className: "sponsor-slot__by",
              children: v("ficha.sponsoredBy", { entidad: f.patrocinio.entidad }),
            }),
            a.jsx("p", { className: "prose", children: f.patrocinio.mensaje }),
            a.jsxs("a", {
              href: "#",
              className: "btn btn--ghost btn--sm",
              children: [v("plans.view"), a.jsx(He, { name: "arrowRight", size: 16 })],
            }),
          ],
        }),
    ],
  });
}
function Fp({ d: f, e: v, fecha: m, onBack: j, onMethod: T, onAlert: S }) {
  const { t: M, lang: b } = tt(),
    [C, O] = ce.useState("when"),
    ne = [
      { id: "when", label: M("ficha.tabWhen") },
      { id: "see", label: M("ficha.tabSee") },
      { id: "stay", label: M("ficha.tabStay") },
    ];
  return a.jsxs("article", {
    className: "ficha",
    "aria-labelledby": "ficha-title",
    children: [
      a.jsx("div", {
        className: "ficha__back",
        children: a.jsxs("button", {
          type: "button",
          className: "back",
          onClick: j,
          children: [a.jsx(He, { name: "chevronLeft", size: 18 }), M("ficha.back")],
        }),
      }),
      a.jsxs("div", {
        className: "ficha__band",
        style: { background: `color-mix(in srgb, ${f.color} 22%, #fff)` },
        children: [
          a.jsx(jh, { kind: f.ilustracion, size: 132, className: "ficha__art" }),
          a.jsx("span", {
            className: `ficha__source ${f.datosReales ? "is-real" : ""}`,
            children: f.datosReales ? M("ficha.realData") : M("ficha.publicData"),
          }),
        ],
      }),
      a.jsxs("header", {
        className: "ficha__head",
        children: [
          a.jsxs("div", {
            className: "ficha__status",
            children: [
              a.jsx(Ku, { fase: v.fase, tipo: f.tipo }),
              a.jsx(Mr, { tipo: v.tipoDato }),
              v.esPrevision && a.jsx(ps, { confianza: v.confianza }),
            ],
          }),
          a.jsx("h3", { id: "ficha-title", className: "ficha__title", children: f.nombre }),
          a.jsxs("p", {
            className: "ficha__place",
            children: [f.lugar, " · ", f.provincia, " · ", f.fenomeno, " · ", f.especie],
          }),
          v.esPrevision
            ? v.transicion &&
              a.jsxs("p", {
                className: "ficha__summary",
                children: [
                  El(m, b),
                  ": ",
                  M("map.transition", {
                    fase: M(`fase.${f.tipo}.${v.transicion.fase}`).toLowerCase(),
                  }),
                ],
              })
            : a.jsx("p", { className: "ficha__summary", children: f.estado.resumen }),
          a.jsxs("p", {
            className: "small muted",
            children: [
              M("ficha.updated", { when: Ho(f.estado.actualizadoEn, b) }),
              " · ",
              M("ficha.source", { fuente: f.estado.fuente }),
            ],
          }),
        ],
      }),
      a.jsx("div", {
        role: "tablist",
        "aria-label": M("ficha.tabs"),
        className: "tabs",
        children: ne.map((J) =>
          a.jsx(
            "button",
            {
              type: "button",
              role: "tab",
              id: `tab-${J.id}`,
              "aria-controls": `panel-${J.id}`,
              "aria-selected": C === J.id,
              tabIndex: C === J.id ? 0 : -1,
              className: "tab",
              onClick: () => O(J.id),
              onKeyDown: (ae) => {
                var pe;
                if (ae.key !== "ArrowRight" && ae.key !== "ArrowLeft") return;
                const me = ne.findIndex((Ee) => Ee.id === C),
                  Pe = ne[(me + (ae.key === "ArrowRight" ? 1 : ne.length - 1)) % ne.length].id;
                (O(Pe), (pe = document.getElementById(`tab-${Pe}`)) == null || pe.focus());
              },
              children: J.label,
            },
            J.id,
          ),
        ),
      }),
      a.jsxs("div", {
        role: "tabpanel",
        id: `panel-${C}`,
        "aria-labelledby": `tab-${C}`,
        children: [
          C === "when" && a.jsx(Dp, { d: f, onMethod: T, onAlert: S }),
          C === "see" && a.jsx(Ap, { d: f }),
          C === "stay" && a.jsx(bp, { d: f }),
        ],
      }),
    ],
  });
}

export { Fp };
