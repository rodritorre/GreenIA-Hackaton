import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He, rh } from "./components/icons.js";
import { un, xa } from "./utils/fechas.js";
import { Ot, oo } from "./data/destinos.js";
import { Mr, Tl, zr } from "./components/ui.js";
import { Cl, fh, qt, ro } from "./utils/fases.js";
import { provincias } from "./data/pueblos.js";
import { UserMenu, useAuth } from "./auth.js";
import { onEnlace, useSeccionActiva } from "./utils/scroll.js";
import { enviarFormulario, fotoComprimida } from "./email.js";
import { EstadoEnvio, useEnvio } from "./negocio.js";
import { config } from "./config.js";

function Ff({ preselect: f }) {
  const { t: v } = tt(),
    [m, j] = ce.useState(f ?? Ot[0].id),
    [T, S] = ce.useState("pleno"),
    [M, b] = ce.useState(7),
    envio = useEnvio(),
    [P, Q] = ce.useState(""),
    { user: U } = useAuth();
  ce.useEffect(() => {
    f && j(f);
  }, [f]);
  const ne = oo(m),
    J = (ae) => {
      ae.preventDefault();
      const email = ae.currentTarget.elements.email.value.trim(),
        fase = v(`fase.${ne.tipo}.${T}`),
        w = ne.ventanas.find((x) => x.fase === T);
      envio.run(() =>
        enviarFormulario({
          tipo: "aviso",
          asunto: `Nuevo aviso: ${ne.nombre} · ${fase}`,
          email,
          nombre: U ? U.nombre : "",
          campos: {
            Destino: ne.nombre,
            Fase: fase,
            Antelación: v("alerts.days", { n: M }),
            "Ventana prevista": w ? `${w.desde} → ${w.hasta}` : "",
            Provincia: P || v("alerts.provinceAny"),
            Email: email,
          },
          confirmacion: {
            asunto: v("mail.alertSubject", { destino: ne.nombre }),
            mensaje: v("mail.alertBody", { destino: ne.nombre, fase: fase.toLowerCase(), n: M }),
          },
        }),
      );
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
                className: "field",
                children: [
                  v("alerts.province"),
                  a.jsxs("select", {
                    value: P,
                    onChange: (ae) => Q(ae.target.value),
                    children: [
                      a.jsx("option", { value: "", children: v("alerts.provinceAny") }),
                      provincias.map((ae) => a.jsx("option", { value: ae, children: ae }, ae)),
                    ],
                  }),
                ],
              }),
              a.jsxs("label", {
                className: "field field--wide",
                children: [
                  v("alerts.email"),
                  a.jsx("input", {
                    type: "email",
                    name: "email",
                    required: !0,
                    placeholder: "tu@email.com",
                    autoComplete: "email",
                    defaultValue: U ? U.email : void 0,
                  }, U ? U.email : "anon"),
                ],
              }),
              a.jsxs("label", {
                className: "consent",
                children: [
                  a.jsx("input", { type: "checkbox", required: !0 }),
                  a.jsxs("span", {
                    children: [
                      v("alerts.consent"),
                      " ",
                      a.jsx("a", { href: "privacidad.html", target: "_blank", rel: "noopener", children: v("mail.privacy") }),
                    ],
                  }),
                ],
              }),
              a.jsx("div", {
                className: "alerts__actions",
                children: a.jsx("button", {
                  type: "submit",
                  className: "btn btn--sun",
                  disabled: envio.estado === "enviando",
                  children: v("alerts.submit"),
                }),
              }),
              a.jsx("div", { className: "alerts__status", children: a.jsx(EstadoEnvio, { envio, ok: v("alerts.done") }) }),
            ],
          }),
        ],
      }),
    }),
  });
}
function Zf() {
  const { t: f } = tt(),
    { user: U } = useAuth(),
    [v, m] = ce.useState(Ot[0].id),
    [j, T] = ce.useState(null),
    [S, M] = ce.useState(null),
    envio = useEnvio(),
    O = ["inicio", "avance", "pleno", "final"],
    ne = Ot.find((me) => me.id === v),
    J = (me) => {
      me.preventDefault();
      const el = me.currentTarget.elements,
        email = el.email.value.trim(),
        nota = el.nota.value.trim();
      envio.run(async () => {
        const foto = await fotoComprimida(j);
        await enviarFormulario({
          tipo: "observacion",
          asunto: `Observación ciudadana: ${ne.nombre} · ${f(`fase.${ne.tipo}.${S}`)}`,
          email,
          nombre: U ? U.nombre : "",
          campos: {
            Destino: ne.nombre,
            "Fase observada": f(`fase.${ne.tipo}.${S}`),
            Archivo: `${j.name} (${Math.round(j.size / 1024)} KB, original)`,
            "Fecha del archivo": new Date(j.lastModified).toLocaleString("es-ES", { timeZone: "Europe/Madrid" }),
            Comentario: nota,
            Email: email,
          },
          adjunto: foto,
          confirmacion: { asunto: f("mail.photoSubject"), mensaje: f("mail.photoBody", { destino: ne.nombre }) },
        });
      });
    };
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
                  children: Ot.map((me) => a.jsx("option", { value: me.id, children: me.nombre }, me.id)),
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
                    a.jsx("span", { children: j ? j.name : f("citizen.choose") }),
                    a.jsx("input", {
                      type: "file",
                      accept: "image/*",
                      className: "sr-only",
                      onChange: (me) => {
                        var Pe;
                        (T(((Pe = me.target.files) == null ? void 0 : Pe[0]) ?? null), envio.reset());
                      },
                    }),
                  ],
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
                      children: [a.jsx(zr, { fase: me, size: 18 }), f(`fase.${ne.tipo}.${me}`)],
                    },
                    me,
                  ),
                ),
              ],
            }),
            a.jsxs("label", {
              className: "field field--light",
              children: [f("citizen.note"), a.jsx("textarea", { name: "nota", rows: 2 })],
            }),
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("citizen.email"),
                a.jsx("input", { type: "email", name: "email", autoComplete: "email", defaultValue: U ? U.email : void 0 }, U ? U.email : "anon"),
              ],
            }),
            a.jsxs("label", {
              className: "consent consent--light",
              children: [
                a.jsx("input", { type: "checkbox", required: !0 }),
                a.jsxs("span", {
                  children: [
                    f("citizen.consent"),
                    " ",
                    a.jsx("a", { href: "privacidad.html", target: "_blank", rel: "noopener", children: f("mail.privacy") }),
                  ],
                }),
              ],
            }),
            a.jsx("button", {
              type: "submit",
              className: "btn btn--primary",
              disabled: !j || !S || envio.estado === "enviando",
              children: f("citizen.submit"),
            }),
            a.jsx(EstadoEnvio, { envio, ok: f("citizen.accepted") }),
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
                  a.jsx("a", { href: "#destino", children: v("footer.panel") }),
                  a.jsx("a", { href: "privacidad.html", children: v("footer.privacy") }),
                  config.demo &&
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
const navItems = [
  { id: "mapa", label: "nav.map" },
  { id: "calendario", label: "nav.calendar" },
  { id: "packs", label: "nav.packs" },
  { id: "avisos", label: "nav.alerts" },
  { id: "negocio", label: "nav.towns" },
];
function $f({ onMethod: f }) {
  const { t: v, lang: m, setLang: j } = tt(),
    T = ["es", "en"],
    // «Calendario» está dentro de la sección del mapa: no se marca aparte.
    act = useSeccionActiva(navItems.map((S) => S.id).filter((S) => S !== "calendario"));
  return a.jsxs(a.Fragment, {
    children: [
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
                navItems.map((S) =>
                  a.jsx(
                    "a",
                    {
                      href: `#${S.id}`,
                      onClick: onEnlace,
                      "aria-current": act === S.id ? "location" : void 0,
                      children: v(S.label),
                    },
                    S.id,
                  ),
                ),
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
                a.jsx(UserMenu, {}),
                a.jsx("a", {
                  href: "#packs",
                  onClick: onEnlace,
                  className: "btn btn--primary site-header__cta",
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

export { $f, Ff, Hf, Wf, Zf };
