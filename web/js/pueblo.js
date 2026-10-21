// Panel del pueblo (#destino=<id>): modo de promoción y aforo, pueblos alternativos,
// solicitudes de negocios, historia y agenda. Todo lo escribe el propio pueblo.
import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He, rh } from "./components/icons.js";
import { un } from "./utils/fechas.js";
import * as pb from "./data/pueblos.js";
import { useAuth } from "./auth.js";

const modos = ["normal", "reducida", "pausada"],
  idDeHash = () => {
    const m = window.location.hash.match(/^#destino=([\w-]+)/);
    return m && pb.conPanel.includes(m[1]) ? m[1] : pb.conPanel[0];
  };

// Se re-renderiza cuando cambia algo publicado por el pueblo.
function usePueblos() {
  const [, f] = ce.useState(0);
  ce.useEffect(() => pb.suscribir(() => f((x) => x + 1)), []);
}

function Guardado({ ok: f }) {
  const { t: v } = tt();
  return f ? a.jsxs("p", { className: "notice notice--ok", role: "status", children: [a.jsx(He, { name: "check", size: 18 }), v("pueblo.saved")] }) : null;
}
function useAviso() {
  const [f, v] = ce.useState(!1);
  return [f, () => (v(!0), setTimeout(() => v(!1), 2e3))];
}

// Aviso que ve el viajero cuando el pueblo limita su promoción.
function AforoAviso({ aforo: f }) {
  const { t: v, lang: m } = tt();
  if (!(f != null && f.completo)) return null;
  const { motivo: j, desde: T, hasta: S } = f.completo,
    M = { desde: un(T, m), hasta: un(S, m, !0) };
  return a.jsxs("section", {
    className: "aforo",
    role: "status",
    children: [
      a.jsxs("p", {
        className: "aforo__title",
        children: [a.jsx(He, { name: "warn", size: 20 }), v(j === "pausa" ? "aforo.paused" : "aforo.full", M)],
      }),
      f.alternativas.length > 0 &&
        a.jsxs(a.Fragment, {
          children: [a.jsx("p", { className: "small", children: v("aforo.why") }), a.jsx(Alternativas, { lista: f.alternativas })],
        }),
    ],
  });
}
function Alternativas({ lista: f }) {
  return a.jsx("ul", {
    className: "alts",
    children: f.map((m) =>
      a.jsxs(
        "li",
        {
          className: "alts__item",
          children: [
            a.jsx(He, { name: "pin", size: 18 }),
            a.jsxs("span", {
              children: [a.jsx("strong", { children: m.nombre }), m.motivo && a.jsxs(a.Fragment, { children: [a.jsx("br", {}), a.jsx("span", { className: "small", children: m.motivo })] })],
            }),
          ],
        },
        m.nombre,
      ),
    ),
  });
}

function Visibilidad({ p: f }) {
  const { t: v, lang: m } = tt(),
    [j, T] = ce.useState(f.visibilidad),
    [ok, avisar] = useAviso(),
    set = (k) => (e) => T((x) => ({ ...x, [k]: e.target.value }));
  return a.jsxs("section", {
    className: "admin-card pueblo__card pueblo__card--wide pueblo__vis",
    "aria-labelledby": "vis-title",
    children: [
      a.jsx("h2", { id: "vis-title", className: "h3", children: v("pueblo.secVisibility") }),
      a.jsxs("div", {
        className: "pueblo__cols",
        children: [
          a.jsxs("form", {
            onSubmit: (J) => (J.preventDefault(), pb.guardarVisibilidad(f.destinoId, { ...j, aforoDiario: Number(j.aforoDiario) || null }), avisar()),
            children: [
              a.jsx("div", {
                role: "radiogroup",
                "aria-label": v("pueblo.secVisibility"),
                className: "segmented",
                children: modos.map((J) =>
                  a.jsxs(
                    "label",
                    {
                      className: j.modo === J ? "is-on" : "",
                      children: [
                        a.jsx("input", { type: "radio", name: "modo", value: J, checked: j.modo === J, onChange: () => T((x) => ({ ...x, modo: J })) }),
                        v(`pueblo.mode.${J}`),
                      ],
                    },
                    J,
                  ),
                ),
              }),
              a.jsx("p", { className: "small muted", children: v(`pueblo.modeHelp.${j.modo}`) }),
              j.modo !== "normal" &&
                a.jsxs("div", {
                  className: "filters__row",
                  children: [
                    a.jsxs("label", {
                      className: "field field--light",
                      children: [v("pueblo.from"), a.jsx("input", { type: "date", value: j.desde, onChange: set("desde"), required: j.modo === "reducida" })],
                    }),
                    a.jsxs("label", {
                      className: "field field--light",
                      children: [v("pueblo.to"), a.jsx("input", { type: "date", value: j.hasta, min: j.desde, onChange: set("hasta"), required: j.modo === "reducida" })],
                    }),
                  ],
                }),
              j.modo === "pausada" &&
                f.pleno &&
                a.jsx("p", { className: "small muted", children: v("pueblo.pausedDefault", { desde: un(f.pleno.desde, m), hasta: un(f.pleno.hasta, m, !0) }) }),
              a.jsxs("label", {
                className: "field field--light",
                children: [
                  v("pueblo.capacity"),
                  a.jsx("input", { type: "number", min: 0, step: 50, value: j.aforoDiario ?? "", onChange: set("aforoDiario"), placeholder: "—" }),
                ],
              }),
              a.jsx("button", { type: "submit", className: "btn btn--primary btn--sm", children: v("pueblo.save") }),
              a.jsx(Guardado, { ok }),
            ],
          }),
          a.jsxs("div", {
            className: "pueblo__preview",
            children: [
              a.jsx("p", { className: "label", children: v("pueblo.preview") }),
              f.aforo.completo ? a.jsx(AforoAviso, { aforo: f.aforo }) : a.jsx("p", { className: "muted", children: v("pueblo.previewNone") }),
              a.jsxs("a", { href: "#mapa", className: "btn btn--ghost btn--sm", children: [v("pueblo.seeMap"), a.jsx(He, { name: "arrowRight", size: 16 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Editor de listas sencillas (pueblos alternativos y agenda).
function Lista({ items: f, campos: v, nuevo: m, onGuardar: j, addLabel: T, saveLabel: S }) {
  const { t: M } = tt(),
    [b, C] = ce.useState(f),
    [ok, avisar] = useAviso(),
    O = (ne, J, ae) => C((me) => me.map((Pe, pe) => (pe === ne ? { ...Pe, [J]: ae } : Pe)));
  return a.jsxs(a.Fragment, {
    children: [
      b.length === 0 && a.jsx("p", { className: "small muted", children: M("pueblo.empty") }),
      a.jsx("ul", {
        className: "agenda-edit",
        children: b.map((ne, J) =>
          a.jsxs(
            "li",
            {
              children: [
                v.map((ae) =>
                  a.jsx(
                    "input",
                    { type: ae.type || "text", "aria-label": ae.label, placeholder: ae.label, value: ne[ae.k] ?? "", onChange: (me) => O(J, ae.k, me.target.value) },
                    ae.k,
                  ),
                ),
                a.jsx("button", { type: "button", className: "link-button", onClick: () => C((ae) => ae.filter((me, Pe) => Pe !== J)), children: M("pueblo.remove") }),
              ],
            },
            J,
          ),
        ),
      }),
      a.jsxs("div", {
        className: "btn-row",
        children: [
          a.jsxs("button", { type: "button", className: "btn btn--ghost btn--sm", onClick: () => C((ne) => [...ne, m()]), children: [a.jsx(He, { name: "plus", size: 16 }), T] }),
          a.jsx("button", {
            type: "button",
            className: "btn btn--primary btn--sm",
            onClick: () => (j(b.filter((ne) => v.every((J) => J.opcional || String(ne[J.k] ?? "").trim()))), avisar()),
            children: S,
          }),
        ],
      }),
      a.jsx(Guardado, { ok }),
    ],
  });
}

function AlternativasCard({ p: f }) {
  const { t: v } = tt();
  return a.jsxs("section", {
    className: "admin-card pueblo__card",
    "aria-labelledby": "alt-title",
    children: [
      a.jsx("h2", { id: "alt-title", className: "h3", children: v("pueblo.secAlts") }),
      a.jsx("p", { className: "small muted", children: v("pueblo.altsLead") }),
      a.jsx(Lista, {
        items: f.alternativas,
        campos: [
          { k: "nombre", label: v("pueblo.altName") },
          { k: "motivo", label: v("pueblo.altWhy"), opcional: !0 },
        ],
        nuevo: () => ({ nombre: "", motivo: "" }),
        onGuardar: (m) => pb.guardarAlternativas(f.destinoId, m),
        addLabel: v("pueblo.addAlt"),
        saveLabel: v("pueblo.saveAlts"),
      }),
    ],
  });
}

function Cola({ p: f }) {
  const { t: v, lang: m } = tt();
  return a.jsxs("section", {
    className: "admin-card pueblo__card",
    "aria-labelledby": "cola-title",
    children: [
      a.jsx("h2", { id: "cola-title", className: "h3", children: v("pueblo.secQueue") }),
      a.jsx("p", { className: "small muted", children: v("pueblo.queueLead") }),
      f.solicitudes.length === 0 && a.jsx("p", { className: "muted", children: v("pueblo.noRequests") }),
      a.jsx("ul", {
        className: "queue",
        children: f.solicitudes.map((j) =>
          a.jsxs(
            "li",
            {
              className: `queue__item verdict--${j.veredicto.estado}`,
              children: [
                a.jsxs("p", {
                  className: "queue__head",
                  children: [
                    a.jsx("strong", { children: j.nombre }),
                    a.jsx("span", { className: `pill pill--verdict-${j.veredicto.estado}`, children: v(`alta.verdict.${j.veredicto.estado}`) }),
                  ],
                }),
                a.jsxs("p", { className: "small muted", children: [v(`alta.types.${j.tipo}`), " · ", j.pueblo, " · ", un(j.recibidaEn.slice(0, 10), m)] }),
              ],
            },
            j.id,
          ),
        ),
      }),
      a.jsxs("a", { href: "#alta", className: "btn btn--ghost btn--sm", children: [v("pueblo.addBusiness"), a.jsx(He, { name: "arrowRight", size: 16 })] }),
    ],
  });
}

function Contenido({ p: f }) {
  const { t: v } = tt(),
    [m, j] = ce.useState(f.historia),
    [ok, avisar] = useAviso();
  return a.jsxs("section", {
    className: "admin-card pueblo__card",
    "aria-labelledby": "cont-title",
    children: [
      a.jsx("h2", { id: "cont-title", className: "h3", children: v("pueblo.secContent") }),
      a.jsxs("form", {
        className: "pueblo__form",
        onSubmit: (T) => (T.preventDefault(), pb.guardarHistoria(f.destinoId, m), avisar()),
        children: [
          a.jsxs("label", { className: "field field--light", children: [v("pueblo.story"), a.jsx("textarea", { rows: 4, value: m, onChange: (T) => j(T.target.value) })] }),
          a.jsx("button", { type: "submit", className: "btn btn--ghost btn--sm", children: v("pueblo.saveStory") }),
          a.jsx(Guardado, { ok }),
        ],
      }),
      a.jsx("h3", { className: "sub", children: v("pueblo.agenda") }),
      a.jsx(Lista, {
        items: f.agenda,
        campos: [
          { k: "fecha", label: v("pueblo.date"), type: "date" },
          { k: "titulo", label: v("pueblo.event") },
        ],
        nuevo: () => ({ fecha: "", titulo: "" }),
        onGuardar: (T) => pb.guardarAgenda(f.destinoId, T),
        addLabel: v("pueblo.addEvent"),
        saveLabel: v("pueblo.saveAgenda"),
      }),
    ],
  });
}

function PanelPueblo() {
  const { t: f, lang: v, setLang: m } = tt(),
    { user: u, logout } = useAuth(),
    fijo = (u == null ? void 0 : u.rol) === "ayuntamiento" && u.destinoId,
    [j, T] = ce.useState(() => fijo || idDeHash());
  usePueblos();
  ce.useEffect(() => {
    fijo && j !== fijo && T(fijo);
  }, [fijo]);
  const S = pb.panel(j),
    M = (b) => (window.history.replaceState(null, "", `#destino=${b}`), T(b));
  return a.jsxs("div", {
    className: "admin pueblo",
    children: [
      a.jsxs("p", { className: "mock-banner", children: [a.jsx(He, { name: "info", size: 16 }), f("pueblo.note")] }),
      a.jsxs("header", {
        className: "admin-bar",
        children: [
          a.jsxs("div", {
            className: "admin-bar__brand",
            children: [
              a.jsx(rh, { size: 28 }),
              a.jsx("span", { className: "brand__name", children: f("brand") }),
              a.jsx("span", { className: "admin-bar__badge", children: f("pueblo.badge") }),
              a.jsx("span", { className: "admin-bar__sub", children: S.nombre }),
            ],
          }),
          a.jsxs("div", {
            className: "admin-bar__end",
            children: [
              !fijo &&
                a.jsxs("label", {
                  className: "pueblo__as",
                  children: [
                    f("pueblo.viewAs"),
                    a.jsx("select", {
                      value: j,
                      onChange: (b) => M(b.target.value),
                      children: pb.destinosPanel.map((b) => a.jsx("option", { value: b.id, children: b.nombre }, b.id)),
                    }),
                  ],
                }),
              a.jsx("div", {
                className: "lang lang--inverse",
                role: "group",
                "aria-label": f("nav.lang"),
                children: ["es", "en"].map((b) => a.jsx("button", { type: "button", "aria-pressed": v === b, onClick: () => m(b), children: b.toUpperCase() }, b)),
              }),
              a.jsxs("a", {
                href: "#mapa",
                className: "btn btn--outline-inverse btn--sm",
                children: [a.jsx(He, { name: "chevronLeft", size: 16 }), f("pueblo.back")],
              }),
              a.jsx("button", { type: "button", className: "btn btn--outline-inverse btn--sm", onClick: logout, children: f("auth.logout") }),
            ],
          }),
        ],
      }),
      a.jsxs(
        "main",
        {
          className: "pueblo__main container",
          children: [
            a.jsx(Visibilidad, { p: S }),
            a.jsx(AlternativasCard, { p: S }),
            a.jsx(Cola, { p: S }),
            a.jsx(Contenido, { p: S }),
          ],
        },
        j,
      ),
    ],
  });
}

export { AforoAviso, Alternativas, PanelPueblo };
