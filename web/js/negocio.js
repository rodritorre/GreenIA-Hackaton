// Secciones para pueblos y negocios: impacto, quién paga, contacto y alta de negocio.
import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He } from "./components/icons.js";
import { Ot, oo } from "./data/destinos.js";
import { Tl } from "./components/ui.js";
import { casosPrueba, normasFinca, registrarSolicitud, tiposNegocio, vacioNegocio } from "./data/pueblos.js";
import { enviarFormulario } from "./email.js";
import { useAuth } from "./auth.js";

// Estado de envío común a todos los formularios: null | "enviando" | "ok" | mensaje de error.
function useEnvio() {
  const { t: f } = tt(),
    [v, m] = ce.useState(null);
  return {
    estado: v,
    reset: () => m(null),
    async run(fn) {
      m("enviando");
      try {
        (await fn(), m("ok"));
      } catch (j) {
        console.error(j);
        m(f(j.message === "email-no-configurado" ? "mail.notConfigured" : "mail.error"));
      }
    },
  };
}
function EstadoEnvio({ envio: f, ok: v }) {
  const { t: m } = tt();
  return f.estado === "enviando"
    ? a.jsxs("p", { className: "alta__analysing", role: "status", children: [a.jsx("span", { className: "spinner", "aria-hidden": "true" }), m("mail.sending")] })
    : f.estado === "ok"
      ? a.jsxs("p", { className: "notice notice--ok", role: "status", children: [a.jsx(He, { name: "check", size: 18 }), v] })
      : f.estado
        ? a.jsxs("p", { className: "notice notice--bad", role: "alert", children: [a.jsx(He, { name: "warn", size: 18 }), f.estado] })
        : null;
}
const Privacidad = () => {
  const { t: f } = tt();
  return a.jsxs("label", {
    className: "consent consent--light",
    children: [
      a.jsx("input", { type: "checkbox", required: !0 }),
      a.jsxs("span", { children: [f("mail.consent"), " ", a.jsx("a", { href: "privacidad.html", target: "_blank", rel: "noopener", children: f("mail.privacy") })] }),
    ],
  });
};

function Impacto() {
  const { t: f, list: v } = tt(),
    cols = [
      { t: "impacto.goodT", l: "impacto.good", icon: "check" },
      { t: "impacto.riskT", l: "impacto.risk", icon: "warn", risk: !0 },
    ];
  return a.jsx("section", {
    id: "impacto",
    className: "impact",
    "aria-labelledby": "impact-title",
    children: a.jsxs("div", {
      className: "container",
      children: [
        a.jsx(Tl, { children: f("impacto.eyebrow") }),
        a.jsx("h2", { id: "impact-title", className: "h2", children: f("impacto.title") }),
        a.jsxs("div", {
          className: "impact__cols",
          children: [
            cols.map((m) =>
              a.jsxs(
                "div",
                {
                  className: "impact__col",
                  children: [
                    a.jsx("h3", { className: "impact__head", children: f(m.t) }),
                    a.jsx("ul", {
                      className: `impact__list ${m.risk ? "impact__list--risk" : ""}`,
                      children: v(m.l).map((j) => a.jsxs("li", { children: [a.jsx(He, { name: m.icon, size: 18 }), j] }, j)),
                    }),
                  ],
                },
                m.t,
              ),
            ),
            a.jsxs("div", {
              className: "impact__col",
              children: [
                a.jsx("h3", { className: "impact__head", children: f("impacto.kpiT") }),
                a.jsx("ol", { className: "impact__kpis", children: v("impacto.kpis").map((m) => a.jsx("li", { children: m }, m)) }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}

// Formulario de contacto para ayuntamientos (licencia de destino).
function Contacto({ open: f, onClose: v }) {
  const { t: m } = tt(),
    { user: u } = useAuth(),
    ref = ce.useRef(null),
    envio = useEnvio(),
    [d, setD] = ce.useState({ nombre: "", entidad: "", email: "", telefono: "", destino: "", mensaje: "" }),
    set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  ce.useEffect(() => {
    const j = ref.current;
    j && (f && !j.open && (j.showModal(), envio.reset(), u && setD((x) => ({ ...x, nombre: x.nombre || u.nombre, email: x.email || u.email }))), !f && j.open && j.close());
  }, [f]);
  const enviar = (e) => (
    e.preventDefault(),
    envio.run(() =>
      enviarFormulario({
        tipo: "contacto",
        asunto: `Licencia de destino: ${d.entidad || d.nombre}`,
        email: d.email,
        nombre: d.nombre,
        campos: { Nombre: d.nombre, Entidad: d.entidad, Email: d.email, Teléfono: d.telefono, Destino: d.destino, Mensaje: d.mensaje },
        confirmacion: { asunto: m("mail.contactSubject"), mensaje: m("mail.contactBody") },
      }),
    )
  );
  return a.jsx("dialog", {
    ref,
    className: "modal auth",
    "aria-labelledby": "contact-title",
    onClose: v,
    onClick: (e) => e.target === ref.current && v(),
    children: a.jsxs("div", {
      className: "modal__inner auth__inner",
      children: [
        a.jsxs("div", {
          className: "modal__head",
          children: [
            a.jsx("h2", { id: "contact-title", className: "h2", children: m("contact.title") }),
            a.jsx("button", { type: "button", className: "icon-btn", "aria-label": m("auth.close"), onClick: v, children: a.jsx(He, { name: "x" }) }),
          ],
        }),
        a.jsx("p", { className: "muted", children: m("contact.lead") }),
        a.jsxs("form", {
          className: "auth__form",
          onSubmit: enviar,
          children: [
            [
              ["nombre", "contact.name", "text", !0, "name"],
              ["entidad", "contact.entity", "text", !0, "organization"],
              ["email", "auth.email", "email", !0, "email"],
              ["telefono", "contact.phone", "tel", !1, "tel"],
            ].map(([k, l, ty, req, ac]) =>
              a.jsxs("label", { className: "field field--light", children: [m(l), a.jsx("input", { type: ty, required: req, autoComplete: ac, value: d[k], onChange: set(k) })] }, k),
            ),
            a.jsxs("label", {
              className: "field field--light",
              children: [
                m("contact.dest"),
                a.jsxs("select", {
                  value: d.destino,
                  onChange: set("destino"),
                  children: [a.jsx("option", { value: "", children: m("contact.otherDest") }), Ot.map((j) => a.jsx("option", { value: j.nombre, children: j.nombre }, j.id))],
                }),
              ],
            }),
            a.jsxs("label", { className: "field field--light", children: [m("contact.message"), a.jsx("textarea", { rows: 3, value: d.mensaje, onChange: set("mensaje") })] }),
            a.jsx(Privacidad, {}),
            a.jsx("button", { type: "submit", className: "btn btn--primary auth__submit", disabled: envio.estado === "enviando", children: m("contact.submit") }),
            a.jsx(EstadoEnvio, { envio, ok: m("contact.done") }),
          ],
        }),
      ],
    }),
  });
}

function Precios() {
  const { t: f, list: v } = tt(),
    [abierto, setAbierto] = ce.useState(!1),
    planes = [
      { id: "destino", per: f("pricing.per.year"), main: !0, onClick: () => setAbierto(!0) },
      { id: "negocio", per: f("pricing.per.season"), href: "#alta", main: !1 },
    ];
  return a.jsx("section", {
    id: "negocio",
    className: "business",
    "aria-labelledby": "business-title",
    children: a.jsxs("div", {
      className: "container",
      children: [
        a.jsx("div", {
          className: "section-head",
          children: a.jsxs("div", {
            children: [
              a.jsx(Tl, { children: f("pricing.eyebrow") }),
              a.jsx("h2", { id: "business-title", className: "h2", children: f("pricing.title") }),
              a.jsx("p", { className: "muted lead-sm", children: f("pricing.lead") }),
            ],
          }),
        }),
        a.jsx("div", {
          className: "pricing",
          children: planes.map((m) =>
            a.jsxs(
              "article",
              {
                className: `plan ${m.main ? "plan--main" : ""}`,
                children: [
                  a.jsx("h3", { className: "plan__name", children: f(`pricing.${m.id}.name`) }),
                  a.jsx("p", { className: "plan__who", children: f(`pricing.${m.id}.who`) }),
                  a.jsxs("p", { className: "plan__price", children: [f(`pricing.${m.id}.price`), a.jsx("span", { children: m.per })] }),
                  a.jsx("p", { className: "small muted", children: f(`pricing.${m.id}.note`) }),
                  a.jsx("ul", {
                    className: "plan__features",
                    children: v(`pricing.${m.id}.features`).map((j) => a.jsxs("li", { children: [a.jsx(He, { name: "check", size: 18 }), j] }, j)),
                  }),
                  m.href
                    ? a.jsxs("a", { href: m.href, className: "btn btn--ghost", children: [f(`pricing.${m.id}.cta`), a.jsx(He, { name: "arrowRight", size: 16 })] })
                    : a.jsxs("button", {
                        type: "button",
                        className: "btn btn--primary",
                        onClick: m.onClick,
                        children: [f(`pricing.${m.id}.cta`), a.jsx(He, { name: "arrowRight", size: 16 })],
                      }),
                ],
              },
              m.id,
            ),
          ),
        }),
        a.jsx(Contacto, { open: abierto, onClose: () => setAbierto(!1) }),
      ],
    }),
  });
}

function AltaNegocio() {
  const { t: f } = tt(),
    { user: u } = useAuth(),
    [v, m] = ce.useState(() => ({ ...vacioNegocio, email: u ? u.email : "" })),
    [S, M] = ce.useState(null),
    envio = useEnvio(),
    O = (J, ae) => m((me) => ({ ...me, [J]: ae })),
    ne = (J) => {
      J.preventDefault();
      envio.run(async () => {
        const s = registrarSolicitud(v),
          d = oo(v.destinoId),
          checks = s.veredicto.comprobaciones.map((x) => `${x.ok ? "✔" : "✘"} ${x.detalle}`).join(" | ");
        await enviarFormulario({
          tipo: "negocio",
          asunto: `Alta de negocio: ${v.nombre} (${d.nombre})`,
          email: v.email,
          nombre: v.nombre,
          campos: {
            Destino: d.nombre,
            Tipo: f(`alta.types.${v.tipo}`),
            Nombre: v.nombre,
            Pueblo: v.pueblo,
            Email: v.email,
            Teléfono: v.telefono,
            "Normas de la finca": v.normas && f(`alta.rulesOpts.${v.normas}`),
            "Distancia de la foto (km)": v.fotoDistanciaKm,
            Descripción: v.descripcion,
            "Reseña destacada": v.resena,
            "Comprobaciones automáticas": checks,
          },
          confirmacion: { asunto: f("mail.bizSubject"), mensaje: f("mail.bizBody", { nombre: v.nombre }) },
        });
        M(s);
      });
    },
    $ = S == null ? void 0 : S.veredicto;
  return a.jsx("section", {
    id: "alta",
    className: "alta",
    "aria-labelledby": "alta-title",
    children: a.jsxs("div", {
      className: "container alta__inner",
      children: [
        a.jsxs("div", {
          className: "alta__copy",
          children: [
            a.jsx(Tl, { children: f("alta.eyebrow") }),
            a.jsx("h2", { id: "alta-title", className: "h2", children: f("alta.title") }),
            a.jsx("p", { className: "muted lead-sm", children: f("alta.lead") }),
            casosPrueba.length > 0 &&
              a.jsxs(a.Fragment, {
                children: [
                  a.jsx("p", { className: "label", children: f("alta.presets") }),
                  a.jsx("div", {
                    className: "chips",
                    children: casosPrueba.map((J) =>
                      a.jsx(
                        "button",
                        { type: "button", className: "chip", "aria-pressed": v.nombre === J.datos.nombre, onClick: () => (m(J.datos), M(null), envio.reset()), children: f(J.key) },
                        J.key,
                      ),
                    ),
                  }),
                ],
              }),
          ],
        }),
        a.jsxs("form", {
          className: "alta__form",
          onSubmit: ne,
          children: [
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("alta.dest"),
                a.jsx("select", { value: v.destinoId, onChange: (J) => O("destinoId", J.target.value), children: Ot.map((J) => a.jsx("option", { value: J.id, children: J.nombre }, J.id)) }),
              ],
            }),
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("alta.type"),
                a.jsx("select", { value: v.tipo, onChange: (J) => O("tipo", J.target.value), children: tiposNegocio.map((J) => a.jsx("option", { value: J, children: f(`alta.types.${J}`) }, J)) }),
              ],
            }),
            a.jsxs("label", { className: "field field--light", children: [f("alta.name"), a.jsx("input", { required: !0, value: v.nombre, onChange: (J) => O("nombre", J.target.value) })] }),
            a.jsxs("label", { className: "field field--light", children: [f("alta.village"), a.jsx("input", { required: !0, value: v.pueblo, onChange: (J) => O("pueblo", J.target.value) })] }),
            a.jsxs("label", {
              className: "field field--light",
              children: [f("auth.email"), a.jsx("input", { type: "email", required: !0, autoComplete: "email", value: v.email, onChange: (J) => O("email", J.target.value) })],
            }),
            a.jsxs("label", {
              className: "field field--light",
              children: [f("contact.phone"), a.jsx("input", { type: "tel", autoComplete: "tel", value: v.telefono, onChange: (J) => O("telefono", J.target.value) })],
            }),
            v.tipo === "finca" &&
              a.jsxs("label", {
                className: "field field--light",
                children: [
                  f("alta.rules"),
                  a.jsxs("select", {
                    value: v.normas ?? "",
                    onChange: (J) => O("normas", J.target.value || void 0),
                    children: [a.jsx("option", { value: "", children: "·" }), normasFinca.map((J) => a.jsx("option", { value: J, children: f(`alta.rulesOpts.${J}`) }, J))],
                  }),
                ],
              }),
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("alta.photo"),
                a.jsx("input", {
                  type: "number",
                  min: 0,
                  step: 0.1,
                  value: v.fotoDistanciaKm ?? "",
                  onChange: (J) => O("fotoDistanciaKm", J.target.value === "" ? void 0 : Number(J.target.value)),
                }),
              ],
            }),
            a.jsxs("label", {
              className: "field field--light field--wide",
              children: [f("alta.desc"), a.jsx("textarea", { rows: 2, value: v.descripcion, onChange: (J) => O("descripcion", J.target.value) })],
            }),
            a.jsxs("label", {
              className: "field field--light field--wide",
              children: [f("alta.review"), a.jsx("textarea", { rows: 2, value: v.resena ?? "", onChange: (J) => O("resena", J.target.value || void 0) })],
            }),
            a.jsx("div", { className: "field--wide", children: a.jsx(Privacidad, {}) }),
            a.jsx("div", {
              className: "alta__actions",
              children: a.jsxs("button", {
                type: "submit",
                className: "btn btn--primary",
                disabled: envio.estado === "enviando",
                children: [a.jsx(He, { name: "check", size: 18 }), f("alta.submit")],
              }),
            }),
            a.jsx("div", { className: "field--wide", children: a.jsx(EstadoEnvio, { envio, ok: f("alta.done") }) }),
            $ &&
              envio.estado === "ok" &&
              a.jsxs("div", {
                className: `verdict verdict--${$.estado}`,
                role: "status",
                children: [
                  a.jsxs("p", { className: "verdict__head", children: [a.jsx(He, { name: $.estado === "recibida" ? "check" : "warn", size: 20 }), f(`alta.verdict.${$.estado}`)] }),
                  a.jsx("p", { className: "label", children: f("alta.checks") }),
                  a.jsx("ul", {
                    className: "checks-inline",
                    children: $.comprobaciones.map((J) =>
                      a.jsxs("li", { className: J.ok ? "is-ok" : "is-bad", children: [a.jsx(He, { name: J.ok ? "check" : "x", size: 14 }), J.detalle] }, J.clave),
                    ),
                  }),
                ],
              }),
          ],
        }),
      ],
    }),
  });
}

export { AltaNegocio, EstadoEnvio, Impacto, Precios, Privacidad, useEnvio };
