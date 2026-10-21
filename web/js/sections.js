import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He, rh } from "./components/icons.js";
import { un, xa } from "./utils/fechas.js";
import { Ot, oo } from "./data/destinos.js";
import { Mr, Tl, zr } from "./components/ui.js";
import { Cl, fh, qt, ro } from "./utils/fases.js";

function Ff({ preselect: f }) {
  const { t: v } = tt(),
    [m, j] = ce.useState(f ?? Ot[0].id),
    [T, S] = ce.useState("pleno"),
    [M, b] = ce.useState(7),
    [C, O] = ce.useState(!1);
  ce.useEffect(() => {
    f && j(f);
  }, [f]);
  const ne = oo(m),
    J = (ae) => {
      (ae.preventDefault(), O(!0));
    };
  return a.jsx("section", {
    id: "avisos",
    className: "alerts-section",
    "aria-labelledby": "alerts-title",
    children: a.jsx("div", {
      className: "container",
      children: a.jsxs("div", {
        className: "alerts",
        children: [
          a.jsxs("div", {
            className: "alerts__copy",
            children: [
              a.jsx("h2", {
                id: "alerts-title",
                className: "h2 h2--inverse",
                children: v("alerts.title"),
              }),
              a.jsx("p", { className: "alerts__lead", children: v("alerts.lead") }),
            ],
          }),
          a.jsxs("form", {
            className: "alerts__form",
            onSubmit: J,
            children: [
              a.jsxs("label", {
                className: "field",
                children: [
                  v("alerts.dest"),
                  a.jsx("select", {
                    value: m,
                    onChange: (ae) => j(ae.target.value),
                    children: Ot.map((ae) =>
                      a.jsx("option", { value: ae.id, children: ae.nombre }, ae.id),
                    ),
                  }),
                ],
              }),
              a.jsxs("label", {
                className: "field",
                children: [
                  v("alerts.phase"),
                  a.jsx("select", {
                    value: T,
                    onChange: (ae) => S(ae.target.value),
                    children: fh.map((ae) =>
                      a.jsx("option", { value: ae, children: v(`fase.${ne.tipo}.${ae}`) }, ae),
                    ),
                  }),
                ],
              }),
              a.jsxs("label", {
                className: "field",
                children: [
                  v("alerts.advance"),
                  a.jsx("select", {
                    value: M,
                    onChange: (ae) => b(Number(ae.target.value)),
                    children: [3, 7, 14].map((ae) =>
                      a.jsx("option", { value: ae, children: v("alerts.days", { n: ae }) }, ae),
                    ),
                  }),
                ],
              }),
              a.jsxs("label", {
                className: "field field--wide",
                children: [
                  v("alerts.email"),
                  a.jsx("input", {
                    type: "email",
                    required: !0,
                    placeholder: "tu@email.com",
                    autoComplete: "email",
                  }),
                ],
              }),
              a.jsxs("label", {
                className: "consent",
                children: [a.jsx("input", { type: "checkbox", required: !0 }), v("alerts.consent")],
              }),
              a.jsx("div", {
                className: "alerts__actions",
                children: a.jsx("button", {
                  type: "submit",
                  className: "btn btn--sun",
                  children: v("alerts.submit"),
                }),
              }),
              C &&
                a.jsxs("p", {
                  className: "alerts__done",
                  role: "status",
                  children: [a.jsx(He, { name: "check", size: 18 }), v("alerts.done")],
                }),
            ],
          }),
        ],
      }),
    }),
  });
}
function Bf() {
  const { t: f } = tt(),
    v = [
      { icon: "bed", title: f("business.stayT"), text: f("business.stayD") },
      { icon: "compass", title: f("business.doT"), text: f("business.doD") },
      { icon: "tag", title: f("business.sponsorT"), text: f("business.sponsorD") },
      { icon: "database", title: f("business.b2bT"), text: f("business.b2bD") },
    ];
  return a.jsx("section", {
    id: "negocio",
    className: "business",
    "aria-labelledby": "business-title",
    children: a.jsxs("div", {
      className: "container",
      children: [
        a.jsxs("div", {
          className: "section-head",
          children: [
            a.jsxs("div", {
              children: [
                a.jsx(Tl, { children: f("business.eyebrow") }),
                a.jsx("h2", {
                  id: "business-title",
                  className: "h2",
                  children: f("business.title"),
                }),
                a.jsx("p", { className: "muted lead-sm", children: f("business.lead") }),
              ],
            }),
            a.jsx("a", {
              href: "#",
              className: "btn btn--primary",
              children: f("business.contact"),
            }),
          ],
        }),
        a.jsx("ul", {
          className: "biz-grid",
          children: v.map((m) =>
            a.jsxs(
              "li",
              {
                className: "biz",
                children: [
                  a.jsx("span", { className: "biz__icon", children: a.jsx(He, { name: m.icon }) }),
                  a.jsx("h3", { className: "biz__title", children: m.title }),
                  a.jsx("p", { className: "biz__text", children: m.text }),
                ],
              },
              m.title,
            ),
          ),
        }),
        a.jsxs("p", {
          className: "biz-scale",
          children: [a.jsx(He, { name: "arrowRight", size: 18 }), f("business.scale")],
        }),
      ],
    }),
  });
}
function Zf() {
  const { t: f } = tt(),
    [v, m] = ce.useState(Ot[0].id),
    [j, T] = ce.useState(null),
    [S, M] = ce.useState(null),
    [b, C] = ce.useState(!1),
    O = ["inicio", "avance", "pleno", "final"],
    ne = Ot.find((me) => me.id === v).tipo,
    J = (me) => {
      (me.preventDefault(), C(!0));
    },
    ae = [
      { ok: !0, text: f("citizen.checkPlace", { n: "0,8", zona: "Zona 2" }) },
      { ok: !0, text: f("citizen.checkTime", { n: 2 }) },
    ];
  return a.jsx("section", {
    id: "verifica",
    className: "citizen",
    "aria-labelledby": "citizen-title",
    children: a.jsxs("div", {
      className: "container citizen__inner",
      children: [
        a.jsxs("div", {
          className: "citizen__copy",
          children: [
            a.jsx(Tl, { children: f("citizen.eyebrow") }),
            a.jsx("h2", { id: "citizen-title", className: "h2", children: f("citizen.title") }),
            a.jsx("p", { className: "muted lead-sm", children: f("citizen.lead") }),
            a.jsx("p", { className: "small muted", children: f("citizen.limits") }),
          ],
        }),
        a.jsxs("form", {
          className: "citizen__form",
          onSubmit: J,
          children: [
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("citizen.dest"),
                a.jsx("select", {
                  value: v,
                  onChange: (me) => m(me.target.value),
                  children: Ot.map((me) =>
                    a.jsx("option", { value: me.id, children: me.nombre }, me.id),
                  ),
                }),
              ],
            }),
            a.jsxs("div", {
              className: "field field--light",
              children: [
                a.jsx("span", { children: f("citizen.photo") }),
                a.jsxs("label", {
                  className: "upload",
                  children: [
                    a.jsx(He, { name: "camera" }),
                    a.jsx("span", { children: j ?? f("citizen.choose") }),
                    a.jsx("input", {
                      type: "file",
                      accept: "image/*",
                      className: "sr-only",
                      onChange: (me) => {
                        var Pe, pe;
                        (T(
                          ((pe = (Pe = me.target.files) == null ? void 0 : Pe[0]) == null
                            ? void 0
                            : pe.name) ?? null,
                        ),
                          C(!1));
                      },
                    }),
                  ],
                }),
              ],
            }),
            j &&
              a.jsxs("div", {
                className: "checks",
                "aria-live": "polite",
                children: [
                  a.jsx("p", { className: "label", children: f("citizen.checks") }),
                  a.jsx("ul", {
                    children: ae.map((me) =>
                      a.jsxs(
                        "li",
                        {
                          className: me.ok ? "is-ok" : "is-bad",
                          children: [a.jsx(He, { name: me.ok ? "check" : "x", size: 16 }), me.text],
                        },
                        me.text,
                      ),
                    ),
                  }),
                ],
              }),
            a.jsxs("fieldset", {
              className: "phase-pick",
              children: [
                a.jsx("legend", { children: f("citizen.phaseQ") }),
                O.map((me) =>
                  a.jsxs(
                    "button",
                    {
                      type: "button",
                      "aria-pressed": S === me,
                      onClick: () => M(me),
                      children: [a.jsx(zr, { fase: me, size: 18 }), f(`fase.${ne}.${me}`)],
                    },
                    me,
                  ),
                ),
              ],
            }),
            a.jsxs("label", {
              className: "consent consent--light",
              children: [a.jsx("input", { type: "checkbox", required: !0 }), f("citizen.consent")],
            }),
            a.jsx("button", {
              type: "submit",
              className: "btn btn--primary",
              disabled: !j || !S,
              children: f("citizen.submit"),
            }),
            b &&
              a.jsxs("p", {
                role: "status",
                className: "notice notice--ok",
                children: [a.jsx(He, { name: "check", size: 18 }), f("citizen.accepted")],
              }),
          ],
        }),
      ],
    }),
  });
}
function Hf({ onMethod: f }) {
  const { t: v } = tt();
  return a.jsxs("footer", {
    className: "site-footer",
    children: [
      a.jsxs("div", {
        className: "container site-footer__inner",
        children: [
          a.jsxs("div", {
            className: "site-footer__brand",
            children: [
              a.jsx("p", { className: "site-footer__name", children: v("brand") }),
              a.jsx("p", { className: "muted", children: v("footer.tagline") }),
            ],
          }),
          a.jsxs("div", {
            className: "site-footer__cols",
            children: [
              a.jsxs("div", {
                className: "site-footer__col",
                children: [
                  a.jsx("p", { className: "label", children: v("footer.explore") }),
                  a.jsx("a", { href: "#mapa", children: v("nav.map") }),
                  a.jsx("a", { href: "#packs", children: v("nav.packs") }),
                  a.jsx("a", { href: "#avisos", children: v("nav.alerts") }),
                  a.jsx("a", { href: "#verifica", children: v("footer.verify") }),
                ],
              }),
              a.jsxs("div", {
                className: "site-footer__col",
                children: [
                  a.jsx("p", { className: "label", children: v("footer.project") }),
                  a.jsx("button", {
                    type: "button",
                    className: "link-button",
                    onClick: f,
                    children: v("nav.method"),
                  }),
                  a.jsx("a", { href: "#negocio", children: v("footer.business") }),
                  a.jsx("a", { href: "#", children: v("footer.privacy") }),
                  a.jsx("a", {
                    href: "#admin",
                    className: "site-footer__admin",
                    children: v("footer.admin"),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      a.jsxs("div", {
        className: "container site-footer__legal",
        children: [
          a.jsx("p", { children: v("footer.attribution") }),
          a.jsx("p", { children: v("footer.copy") }),
        ],
      }),
    ],
  });
}
function $f({ onMethod: f }) {
  const { t: v, lang: m, setLang: j } = tt(),
    T = ["es", "en"];
  return a.jsxs(a.Fragment, {
    children: [
      a.jsxs("p", {
        className: "mock-banner",
        children: [a.jsx(He, { name: "info", size: 16 }), v("mockBanner")],
      }),
      a.jsx("header", {
        className: "site-header",
        children: a.jsxs("div", {
          className: "container site-header__inner",
          children: [
            a.jsxs("a", {
              href: "#top",
              className: "brand",
              children: [
                a.jsx(rh, {}),
                a.jsx("span", { className: "brand__name", children: v("brand") }),
              ],
            }),
            a.jsxs("nav", {
              "aria-label": v("nav.main"),
              className: "site-nav",
              children: [
                a.jsx("a", { href: "#mapa", "aria-current": "page", children: v("nav.map") }),
                a.jsx("a", { href: "#mapa", children: v("nav.calendar") }),
                a.jsx("a", { href: "#packs", children: v("nav.packs") }),
                a.jsx("a", { href: "#avisos", children: v("nav.alerts") }),
                a.jsx("button", {
                  type: "button",
                  className: "link-button",
                  onClick: f,
                  children: v("nav.method"),
                }),
              ],
            }),
            a.jsxs("div", {
              className: "site-header__end",
              children: [
                a.jsx("div", {
                  className: "lang",
                  role: "group",
                  "aria-label": v("nav.lang"),
                  children: T.map((S, M) =>
                    a.jsxs(
                      "span",
                      {
                        className: "lang__item",
                        children: [
                          M > 0 &&
                            a.jsx("span", {
                              "aria-hidden": "true",
                              className: "lang__sep",
                              children: "/",
                            }),
                          a.jsx("button", {
                            type: "button",
                            "aria-pressed": m === S,
                            onClick: () => j(S),
                            children: S.toUpperCase(),
                          }),
                        ],
                      },
                      S,
                    ),
                  ),
                }),
                a.jsx("a", {
                  href: "#packs",
                  className: "btn btn--primary",
                  children: v("nav.cta"),
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
function Wf({ onPick: f, onMethod: v }) {
  const { t: m, lang: j } = tt(),
    T = Ot.map((M) => ({ d: M, e: Cl(M, qt) })).filter(
      ({ e: M }) => M.fase === "avance" || M.fase === "pleno",
    ),
    S = Ot.filter((M) => M.estado.fase === "fuera_temporada").sort((M, b) =>
      ro(M).desde.localeCompare(ro(b).desde),
    )[0];
  return a.jsx("section", {
    className: "hero",
    id: "top",
    children: a.jsxs("div", {
      className: "container hero__inner",
      children: [
        a.jsxs("div", {
          className: "hero__copy",
          children: [
            a.jsx(Tl, { children: m("hero.eyebrow") }),
            a.jsx("h1", { className: "hero__title", children: m("hero.title") }),
            a.jsx("p", { className: "hero__lead", children: m("hero.lead") }),
            a.jsxs("div", {
              className: "btn-row",
              children: [
                a.jsx("a", {
                  href: "#mapa",
                  className: "btn btn--primary btn--lg",
                  children: m("hero.explore"),
                }),
                a.jsx("button", {
                  type: "button",
                  className: "btn btn--ghost btn--lg",
                  onClick: v,
                  children: m("hero.how"),
                }),
              ],
            }),
          ],
        }),
        a.jsxs("aside", {
          "aria-labelledby": "hero-now",
          className: "now-card",
          children: [
            a.jsxs("div", {
              className: "now-card__head",
              children: [
                a.jsx("p", { id: "hero-now", className: "label", children: m("hero.asideTitle") }),
                a.jsxs("span", {
                  className: "now-badge",
                  children: [
                    a.jsx("span", { "aria-hidden": "true", className: "now-badge__dot" }),
                    un(qt, j, !0),
                  ],
                }),
              ],
            }),
            a.jsxs("div", {
              className: "now-card__list",
              children: [
                T.length === 0 &&
                  a.jsx("p", { className: "muted", children: m("hero.asideEmpty") }),
                T.map(({ d: M, e: b }) =>
                  a.jsxs(
                    "button",
                    {
                      type: "button",
                      className: "now-item",
                      onClick: () => f(M.id),
                      children: [
                        a.jsx("span", {
                          className: "now-item__glyph",
                          children: a.jsx(zr, { fase: b.fase, size: 32 }),
                        }),
                        a.jsxs("span", {
                          className: "now-item__text",
                          children: [
                            a.jsx("span", { className: "now-item__name", children: M.nombre }),
                            a.jsx("span", {
                              className: "now-item__meta",
                              children: m(`fase.${M.tipo}.${b.fase}`),
                            }),
                            a.jsx(Mr, { tipo: b.tipoDato }),
                          ],
                        }),
                        a.jsx(He, { name: "chevronRight" }),
                      ],
                    },
                    M.id,
                  ),
                ),
                S &&
                  a.jsxs(a.Fragment, {
                    children: [
                      a.jsx("p", { className: "label label--sub", children: m("hero.next") }),
                      a.jsxs("button", {
                        type: "button",
                        className: "now-item",
                        onClick: () => f(S.id),
                        children: [
                          a.jsx("span", {
                            className: "now-item__glyph",
                            children: a.jsx(zr, { fase: "fuera_temporada", size: 32 }),
                          }),
                          a.jsxs("span", {
                            className: "now-item__text",
                            children: [
                              a.jsx("span", { className: "now-item__name", children: S.nombre }),
                              a.jsxs("span", {
                                className: "now-item__meta",
                                children: [
                                  m(`fase.${S.tipo}.pleno`),
                                  ": ",
                                  xa(ro(S).desde, ro(S).hasta, j, !0),
                                ],
                              }),
                              a.jsx(Mr, { tipo: "previsto" }),
                            ],
                          }),
                          a.jsx(He, { name: "chevronRight" }),
                        ],
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}

export { $f, Bf, Ff, Hf, Wf, Zf };
