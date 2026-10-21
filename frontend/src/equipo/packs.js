// Trip packs ("Packs de viaje"), from the team's web/js/packs.js. Kept as plain JS so it stays the
// team's code; compat.ts maps its imports onto this app.
import { a, ce, tt, He, Ku, Tl, jh, El, Ot, oo } from "./compat";
import { comprobado, packs } from "./data/packs.js";
import { alojamientos, cotizar, masBarata, meses, opciones } from "./data/ofertasMes.js";

// Texto bilingüe { es, en } → string del idioma activo.
const L = (x, lang) => (x && typeof x === "object" ? (x[lang] ?? x.es) : (x ?? ""));

const mapsUrl = (nombre, lugar) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nombre}, ${lugar}`)}`;

const iconoTipo = { restaurante: "utensils", alojamiento: "bed", actividad: "compass" };

const eur = (n, lang) =>
  `${n.toLocaleString(lang === "en" ? "en-GB" : "es-ES", {
    minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2,
    maximumFractionDigits: 2,
  })} €`;

const DIA = 864e5;
const nochesEntre = (entrada, salida) => {
  if (!entrada || !salida) return 1;
  const n = Math.round((Date.parse(salida) - Date.parse(entrada)) / DIA);
  return n > 0 ? n : 1;
};
// Meses de distancia (hacia delante) entre dos meses "MM".
const distMes = (desde, hasta) => (Number(hasta) - Number(desde) + 12) % 12;

const BUSQUEDA_INICIAL = { destino: "", entrada: "", salida: "", adultos: 2, ninos: 0, habs: 1 };

function Parada({ s, lang, t }) {
  return a.jsxs("li", {
    className: `stop stop--${s.tipo}`,
    children: [
      a.jsx("span", {
        className: "stop__icon",
        "aria-hidden": "true",
        children: a.jsx(He, { name: iconoTipo[s.tipo], size: 18 }),
      }),
      a.jsxs("div", {
        className: "stop__body",
        children: [
          a.jsxs("p", {
            className: "stop__when",
            children: L(s.momento, lang),
          }),
          a.jsx("h4", { className: "stop__name", children: s.nombre }),
          a.jsx("p", { className: "stop__place", children: s.lugar }),
          a.jsx("p", { className: "stop__note", children: L(s.nota, lang) }),
          s.alternativa &&
            a.jsxs("p", {
              className: "stop__alt",
              children: [
                a.jsxs("strong", { children: [t("packs.alt"), " "] }),
                s.alternativa.nombre,
                ". ",
                L(s.alternativa.nota, lang),
              ],
            }),
          (s.tipo !== "actividad" || s.web) &&
            a.jsxs("div", {
              className: "stop__links",
              children: [
                s.precio &&
                  a.jsxs("span", {
                    className: "stop__price",
                    children: [t("packs.perPerson"), " ", a.jsx("strong", { children: s.precio })],
                  }),
                s.web &&
                  a.jsxs("a", {
                    href: s.web,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    children: [a.jsx(He, { name: "external", size: 15 }), t("packs.web")],
                  }),
                s.tel &&
                  a.jsxs("a", {
                    href: `tel:+34${s.tel.replace(/\s/g, "")}`,
                    children: [a.jsx(He, { name: "phone", size: 15 }), s.tel],
                  }),
                a.jsxs("a", {
                  href: mapsUrl(s.nombre, s.lugar),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: [a.jsx(He, { name: "pin", size: 15 }), t("packs.directions")],
                }),
              ],
            }),
        ],
      }),
    ],
  });
}

// ---------- Barra de búsqueda ----------
function Stepper({ label, sub, value, min, max, onChange, t }) {
  return a.jsxs("div", {
    className: "stepper",
    children: [
      a.jsxs("span", {
        className: "stepper__label",
        children: [label, sub && a.jsx("small", { children: sub })],
      }),
      a.jsxs("div", {
        className: "stepper__ctrl",
        children: [
          a.jsx("button", {
            type: "button",
            "aria-label": `${t("packs.q.less")} ${label}`,
            disabled: value <= min,
            onClick: () => onChange(value - 1),
            children: a.jsx(He, { name: "minus", size: 16 }),
          }),
          a.jsx("output", { "aria-live": "polite", children: value }),
          a.jsx("button", {
            type: "button",
            "aria-label": `${t("packs.q.more")} ${label}`,
            disabled: value >= max,
            onClick: () => onChange(value + 1),
            children: a.jsx(He, { name: "plus", size: 16 }),
          }),
        ],
      }),
    ],
  });
}

const resumenGrupo = (g, t) =>
  [
    t(g.adultos === 1 ? "packs.q.adult1" : "packs.q.adults", { n: g.adultos }),
    t(g.ninos === 1 ? "packs.q.child1" : "packs.q.children", { n: g.ninos }),
    t(g.habs === 1 ? "packs.q.room1" : "packs.q.rooms", { n: g.habs }),
  ].join(" · ");

function Buscador({ value, onChange, onSubmit, t }) {
  const [abierto, setAbierto] = ce.useState(false),
    caja = ce.useRef(null),
    set = (k, v) => onChange({ ...value, [k]: v });
  ce.useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => caja.current && !caja.current.contains(e.target) && setAbierto(false),
      esc = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [abierto]);
  return a.jsxs("form", {
    className: "tsearch",
    role: "search",
    onSubmit: (e) => {
      e.preventDefault();
      setAbierto(false);
      onSubmit();
    },
    children: [
      a.jsxs("label", {
        className: "tsearch__field tsearch__dest",
        children: [
          a.jsx(He, { name: "bed", size: 22 }),
          a.jsxs("span", {
            className: "tsearch__stack",
            children: [
              a.jsx("span", { className: "tsearch__lbl", children: t("packs.q.destLabel") }),
              a.jsxs("select", {
                value: value.destino,
                onChange: (e) => set("destino", e.target.value),
                children: [
                  a.jsx("option", { value: "", children: t("packs.q.anyDest") }),
                  Ot.map((d) => a.jsx("option", { value: d.id, children: d.nombre }, d.id)),
                ],
              }),
            ],
          }),
        ],
      }),
      a.jsxs("div", {
        className: "tsearch__field tsearch__dates",
        children: [
          a.jsx(He, { name: "calendar", size: 22 }),
          a.jsxs("span", {
            className: "tsearch__stack",
            children: [
              a.jsx("span", { className: "tsearch__lbl", children: t("packs.q.datesLabel") }),
              a.jsxs("span", {
                className: "tsearch__daterow",
                children: [
                  a.jsx("input", {
                    type: "date",
                    "aria-label": t("packs.q.checkin"),
                    title: t("packs.q.checkin"),
                    value: value.entrada,
                    onChange: (e) => {
                      const entrada = e.target.value,
                        salida =
                          !value.salida || value.salida <= entrada
                            ? entrada && new Date(Date.parse(entrada) + DIA).toISOString().slice(0, 10)
                            : value.salida;
                      onChange({ ...value, entrada, salida: salida || "" });
                    },
                  }),
                  a.jsx("span", { "aria-hidden": "true", children: "—" }),
                  a.jsx("input", {
                    type: "date",
                    "aria-label": t("packs.q.checkout"),
                    title: t("packs.q.checkout"),
                    min: value.entrada || void 0,
                    value: value.salida,
                    onChange: (e) => set("salida", e.target.value),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      a.jsxs("div", {
        className: "tsearch__field tsearch__occ",
        ref: caja,
        children: [
          a.jsxs("button", {
            type: "button",
            className: "tsearch__occbtn",
            "aria-expanded": abierto,
            "aria-controls": "occ-panel",
            onClick: () => setAbierto(!abierto),
            children: [
              a.jsx(He, { name: "user", size: 22 }),
              a.jsxs("span", {
                className: "tsearch__stack",
                children: [
                  a.jsx("span", { className: "tsearch__lbl", children: t("packs.q.occLabel") }),
                  a.jsx("span", { className: "tsearch__val", children: resumenGrupo(value, t) }),
                ],
              }),
              a.jsx(He, { name: "chevronDown", size: 18, className: "tsearch__chev" }),
            ],
          }),
          abierto &&
            a.jsxs("div", {
              id: "occ-panel",
              className: "occ-panel",
              children: [
                a.jsx(Stepper, {
                  t,
                  label: t("packs.q.adultsL"),
                  value: value.adultos,
                  min: 1,
                  max: 8,
                  onChange: (v) => set("adultos", v),
                }),
                a.jsx(Stepper, {
                  t,
                  label: t("packs.q.childrenL"),
                  sub: t("packs.q.childrenSub"),
                  value: value.ninos,
                  min: 0,
                  max: 6,
                  onChange: (v) => set("ninos", v),
                }),
                a.jsx(Stepper, {
                  t,
                  label: t("packs.q.roomsL"),
                  value: value.habs,
                  min: 1,
                  max: 4,
                  onChange: (v) => set("habs", v),
                }),
                a.jsx("button", {
                  type: "button",
                  className: "btn btn--ghost btn--sm occ-panel__done",
                  onClick: () => setAbierto(false),
                  children: t("packs.q.done"),
                }),
              ],
            }),
        ],
      }),
      a.jsx("button", { type: "submit", className: "tsearch__go", children: t("packs.q.search") }),
    ],
  });
}

// ---------- Caja de resultado ----------
function Resultado({ m, grupo, lang, t, onOpen }) {
  const d = oo(m.destinoId),
    { q } = masBarata(m.destinoId, m, grupo);
  return a.jsxs("button", {
    type: "button",
    className: "trip",
    style: { "--season": d.color },
    onClick: () => onOpen(m.id),
    "aria-haspopup": "dialog",
    children: [
      a.jsxs("span", {
        className: "trip__band",
        "aria-hidden": "true",
        children: [
          a.jsx(jh, { kind: d.ilustracion, size: 74, className: "trip__art" }),
          a.jsx("span", { className: "trip__month", children: L(m.mes, lang) }),
        ],
      }),
      a.jsxs("span", {
        className: "trip__body",
        children: [
          a.jsx("span", { className: "trip__dest", children: d.nombre }),
          a.jsx("span", { className: "trip__title", children: L(m.titulo, lang) }),
          a.jsx(Ku, { fase: m.fase, tipo: d.tipo }),
          a.jsxs("span", {
            className: "trip__price",
            children: [
              a.jsx("small", { children: t("packs.from") }),
              a.jsx("strong", { children: eur(q.total, lang) }),
              a.jsx("small", { children: t("packs.q.total") }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ---------- Ficha a pantalla completa (se abre al pulsar una caja) ----------
function Dato({ icon, label, value }) {
  return a.jsxs("div", {
    className: "tview__fact",
    children: [
      a.jsx("span", { className: "tview__facticon", children: a.jsx(He, { name: icon, size: 18 }) }),
      a.jsxs("span", {
        children: [
          a.jsx("span", { className: "tview__factlbl", children: label }),
          a.jsx("span", { className: "tview__factval", children: value }),
        ],
      }),
    ],
  });
}

function Ficha({ m, grupo, lang, t, onClose, onMap }) {
  const ref = ce.useRef(null),
    d = oo(m.destinoId),
    ops = opciones[m.destinoId],
    [opId, setOpId] = ce.useState(() => masBarata(m.destinoId, m, grupo).op.id),
    op = ops.find((o) => o.id === opId) ?? ops[0],
    al = alojamientos[op.aloj],
    q = cotizar(op, m, grupo),
    pack = packs.find((p) => p.destinoId === m.destinoId),
    comidas = pack ? pack.dias.flat().filter((s) => s.tipo === "restaurante" || s.mesa).length : 0,
    noches = t(grupo.noches === 1 ? "packs.q.night1" : "packs.q.nights", { n: grupo.noches }),
    cerrar = () => ref.current && ref.current.close(),
    // Lo que se muestra refleja las habitaciones con las que se ha calculado el precio.
    visto = { ...grupo, habs: op.pp ? grupo.habs : q.habitaciones },
    // El pago se abre en otra pestaña (pago.html) con los datos del pedido en la URL.
    abrirPago = () => {
      const pedido = {
        lang,
        color: d.color,
        destino: d.nombre,
        provincia: d.provincia,
        mes: L(m.mes, lang),
        titulo: L(m.titulo, lang),
        alojamiento: al.nombre,
        lugar: al.lugar,
        habitacion: L(op.habitacion, lang),
        grupo: resumenGrupo(visto, t),
        noches,
        lineas: [
          { c: `${al.nombre}${op.pp ? "" : ` · ${t(q.habitaciones === 1 ? "packs.q.room1" : "packs.q.rooms", { n: q.habitaciones })}`} · ${noches}`, v: q.alojamiento },
          ...m.extras.map((e) => ({ c: `${L(e.concepto, lang)} (${eur(e.pp, lang)} × ${grupo.adultos})`, v: e.pp * grupo.adultos })),
        ],
        total: q.total,
        noIncluye: L(m.noIncluye, lang),
      };
      window.open(`pago.html#${encodeURIComponent(JSON.stringify(pedido))}`, "_blank", "noopener");
    };
  ce.useEffect(() => {
    const dlg = ref.current;
    dlg && !dlg.open && dlg.showModal();
    dlg && dlg.scrollTo(0, 0);
  }, []);
  const precioBloque = (extra) =>
    a.jsxs("div", {
      className: `tview__total ${extra ?? ""}`,
      children: [
        a.jsxs("div", {
          children: [
            a.jsx("span", { className: "tview__totallbl", children: t("packs.q.totalLabel") }),
            a.jsx("strong", { className: "tview__totalnum", children: eur(q.total, lang) }),
            a.jsx("span", {
              className: "tview__totalpp",
              children: `${t("packs.q.perPersonN", { n: eur(q.porPersona, lang) })} · ${noches}`,
            }),
          ],
        }),
        a.jsxs("button", {
          type: "button",
          className: "btn btn--primary btn--lg tview__cta",
          onClick: abrirPago,
          children: [t("packs.pay.book"), a.jsx(He, { name: "external", size: 18 })],
        }),
      ],
    });
  return a.jsxs("dialog", {
    ref,
    className: "tview",
    "aria-labelledby": "trip-title",
    style: { "--season": d.color },
    onClose,
    children: [
      a.jsxs("div", {
        className: "tview__top",
        children: [
          a.jsxs("button", {
            type: "button",
            className: "tview__back",
            onClick: cerrar,
            children: [a.jsx(He, { name: "chevronLeft", size: 20 }), t("packs.q.back")],
          }),
          a.jsx("span", { className: "tview__toptitle", children: `${L(m.mes, lang)} · ${d.nombre}` }),
          a.jsx("button", {
            type: "button",
            className: "icon-btn",
            "aria-label": t("method.close"),
            onClick: cerrar,
            children: a.jsx(He, { name: "x" }),
          }),
        ],
      }),
      a.jsx("header", {
        className: "tview__hero",
        children: a.jsxs("div", {
          className: "container tview__heroin",
          children: [
            a.jsxs("div", {
              className: "tview__herotext",
              children: [
                a.jsxs("div", {
                  className: "tview__badges",
                  children: [
                    a.jsx("span", { className: "tview__month", children: L(m.mes, lang) }),
                    a.jsx(Ku, { fase: m.fase, tipo: d.tipo }),
                  ],
                }),
                a.jsxs("p", { className: "tview__kicker", children: [d.nombre, " · ", d.provincia] }),
                a.jsx("h2", { id: "trip-title", className: "tview__title", children: L(m.titulo, lang) }),
                a.jsx("p", { className: "tview__lead", children: L(m.dia, lang) }),
                a.jsxs("div", {
                  className: "tview__facts",
                  children: [
                    a.jsx(Dato, { icon: "calendar", label: t("packs.duration"), value: noches }),
                    a.jsx(Dato, { icon: "user", label: t("packs.q.occLabelShort"), value: resumenGrupo(visto, t) }),
                    comidas > 0 &&
                      a.jsx(Dato, {
                        icon: "utensils",
                        label: t("packs.meals"),
                        value: t(comidas === 1 ? "packs.mealsOne" : "packs.mealsN", { n: comidas }),
                      }),
                  ],
                }),
              ],
            }),
            a.jsx("div", {
              className: "tview__heroart",
              "aria-hidden": "true",
              children: a.jsx(jh, { kind: d.ilustracion, size: 280 }),
            }),
          ],
        }),
      }),
      a.jsxs("div", {
        className: "container tview__layout",
        children: [
          a.jsxs("div", {
            className: "tview__main",
            children: [
              m.aviso &&
                a.jsxs("p", {
                  className: "tview__notice",
                  children: [a.jsx(He, { name: "info", size: 18 }), L(m.aviso, lang)],
                }),
              pack &&
                a.jsxs("section", {
                  "aria-labelledby": "trip-plan",
                  children: [
                    a.jsx("h3", { id: "trip-plan", className: "tview__h3", children: t("packs.q.planTitle") }),
                    a.jsxs("div", {
                      className: "tview__dish",
                      children: [
                        a.jsx(He, { name: "utensils", size: 18 }),
                        a.jsxs("span", {
                          children: [
                            a.jsx("span", { className: "tview__factlbl", children: t("packs.dish") }),
                            a.jsx("strong", { children: L(pack.plato, lang) }),
                          ],
                        }),
                      ],
                    }),
                    a.jsx("div", {
                      className: "tview__days",
                      children: pack.dias.map((dia, i) =>
                        a.jsxs(
                          "div",
                          {
                            className: "tview__day",
                            children: [
                              a.jsxs("h4", {
                                className: "tview__daytitle",
                                children: [
                                  a.jsx("span", { children: i + 1 }),
                                  t("packs.day", { n: i + 1 }),
                                ],
                              }),
                              a.jsx("ol", {
                                className: "stops",
                                children: dia.map((s) => a.jsx(Parada, { s, lang, t }, s.nombre)),
                              }),
                            ],
                          },
                          i,
                        ),
                      ),
                    }),
                    a.jsxs("p", {
                      className: "small muted pack__sources",
                      children: [
                        t("packs.sources"),
                        " ",
                        pack.fuentes.map((s, i) =>
                          a.jsxs(
                            ce.Fragment,
                            {
                              children: [
                                i > 0 && " · ",
                                a.jsx("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", children: s.nombre }),
                              ],
                            },
                            s.url,
                          ),
                        ),
                      ],
                    }),
                    a.jsxs("button", {
                      type: "button",
                      className: "btn btn--ghost",
                      onClick: () => {
                        cerrar();
                        onMap(d.id);
                      },
                      children: [t("packs.seeMap"), a.jsx(He, { name: "arrowRight", size: 18 })],
                    }),
                  ],
                }),
            ],
          }),
          a.jsxs("aside", {
            className: "tview__book",
            "aria-labelledby": "trip-book",
            children: [
              a.jsx("h3", { id: "trip-book", className: "tview__booktitle", children: t("packs.choose") }),
              a.jsx("p", { className: "tview__for", children: `${resumenGrupo(visto, t)} · ${noches}` }),
              a.jsx("div", {
                className: "tview__opts",
                role: "radiogroup",
                "aria-labelledby": "trip-book",
                children: ops.map((o) => {
                  const qo = cotizar(o, m, grupo),
                    on = o.id === op.id;
                  return a.jsxs(
                    "label",
                    {
                      className: `topt${on ? " is-on" : ""}`,
                      children: [
                        a.jsx("input", {
                          type: "radio",
                          className: "sr-only",
                          name: `op-${m.id}`,
                          value: o.id,
                          checked: on,
                          onChange: () => setOpId(o.id),
                        }),
                        a.jsxs("span", {
                          className: "topt__head",
                          children: [
                            a.jsx("span", { className: "topt__tag", children: L(o.etiqueta, lang) }),
                            a.jsx("span", { className: "topt__price", children: eur(qo.total, lang) }),
                          ],
                        }),
                        a.jsx("span", { className: "topt__name", children: alojamientos[o.aloj].nombre }),
                        a.jsx("span", { className: "topt__room", children: L(o.habitacion, lang) }),
                        a.jsxs("span", {
                          className: "topt__rate",
                          children: [
                            o.pp
                              ? t("packs.q.ppRate", { n: eur(o.pp, lang) })
                              : t("packs.q.roomRate", { n: eur(o.noche, lang) }),
                            qo.ajustado &&
                              !o.pp &&
                              ` · ${t("packs.q.roomsUsed", { n: qo.habitaciones })}`,
                          ],
                        }),
                        on && a.jsx("span", { className: "topt__check", "aria-hidden": "true", children: a.jsx(He, { name: "check", size: 14 }) }),
                      ],
                    },
                    o.id,
                  );
                }),
              }),
              precioBloque(),
              a.jsxs("ul", {
                className: "tview__breakdown",
                children: [
                  a.jsxs("li", {
                    children: [
                      a.jsxs("span", {
                        children: [
                          al.nombre,
                          op.desayuno ? ` (${t("packs.breakfast")})` : "",
                          !op.pp && ` · ${t(q.habitaciones === 1 ? "packs.q.room1" : "packs.q.rooms", { n: q.habitaciones })}`,
                        ],
                      }),
                      a.jsx("span", { children: eur(q.alojamiento, lang) }),
                    ],
                  }),
                  m.extras.map((e) =>
                    a.jsxs(
                      "li",
                      {
                        children: [
                          a.jsx("span", { children: `${L(e.concepto, lang)} (${eur(e.pp, lang)} × ${grupo.adultos})` }),
                          a.jsx("span", { children: eur(e.pp * grupo.adultos, lang) }),
                        ],
                      },
                      L(e.concepto, "es"),
                    ),
                  ),
                ],
              }),
              a.jsxs("ul", {
                className: "tview__notes",
                children: [
                  a.jsxs("li", { children: [t("packs.notIncluded"), " ", L(m.noIncluye, lang)] }),
                  q.ajustado && !op.pp && a.jsx("li", { children: t("packs.q.roomsNote", { n: q.habitaciones }) }),
                  grupo.ninos > 0 && a.jsx("li", { children: t("packs.q.kidsNote") }),
                  a.jsxs("li", { children: [t("packs.priceSource"), " ", al.fuente] }),
                  a.jsx("li", {
                    children: a.jsxs("a", {
                      href: al.web,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "tview__staylink",
                      children: [t("packs.seeStay"), " ", a.jsx(He, { name: "external", size: 13 })],
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      precioBloque("tview__bar"),
    ],
  });
}

// ---------- Sección ----------
function Kp({ fecha: f, onPick: v }) {
  const { t, lang } = tt(),
    [borrador, setBorrador] = ce.useState(BUSQUEDA_INICIAL),
    [busqueda, setBusqueda] = ce.useState(BUSQUEDA_INICIAL),
    [abierta, setAbierta] = ce.useState(null),
    noches = nochesEntre(busqueda.entrada, busqueda.salida),
    grupo = { adultos: busqueda.adultos, ninos: busqueda.ninos, habs: busqueda.habs, noches },
    // Sin fecha: se ordena desde el mes del mapa. Con fecha: desde el mes de entrada.
    mesRef = (busqueda.entrada || f).slice(5, 7),
    porDestino = meses.filter((m) => !busqueda.destino || m.destinoId === busqueda.destino),
    exactos = busqueda.entrada ? porDestino.filter((m) => m.id.slice(5) === mesRef) : porDestino,
    sinCoincidencia = busqueda.entrada && exactos.length === 0,
    resultados = (sinCoincidencia ? porDestino : exactos)
      .slice()
      .sort((x, y) => distMes(mesRef, x.id.slice(5)) - distMes(mesRef, y.id.slice(5))),
    abiertaM = meses.find((m) => m.id === abierta),
    filtrado = JSON.stringify(busqueda) !== JSON.stringify(BUSQUEDA_INICIAL);
  return a.jsx("section", {
    id: "packs",
    className: "packs",
    "aria-labelledby": "packs-title",
    children: a.jsxs("div", {
      className: "container",
      children: [
        a.jsx("div", {
          className: "section-head",
          children: a.jsxs("div", {
            children: [
              a.jsx(Tl, { children: t("packs.eyebrow") }),
              a.jsx("h2", { id: "packs-title", className: "h2", children: t("packs.title") }),
              a.jsx("p", { className: "muted lead-sm", children: t("packs.lead") }),
            ],
          }),
        }),
        a.jsx(Buscador, {
          t,
          value: borrador,
          onChange: setBorrador,
          onSubmit: () => setBusqueda(borrador),
        }),
        a.jsxs("div", {
          className: "trips-head",
          "aria-live": "polite",
          children: [
            a.jsxs("p", {
              children: [
                a.jsx("strong", {
                  children: t(resultados.length === 1 ? "packs.q.result1" : "packs.q.results", {
                    n: resultados.length,
                  }),
                }),
                " · ",
                resumenGrupo(busqueda, t),
                " · ",
                t(noches === 1 ? "packs.q.night1" : "packs.q.nights", { n: noches }),
              ],
            }),
            filtrado &&
              a.jsx("button", {
                type: "button",
                className: "link-button",
                onClick: () => {
                  setBorrador(BUSQUEDA_INICIAL);
                  setBusqueda(BUSQUEDA_INICIAL);
                },
                children: t("packs.q.clear"),
              }),
          ],
        }),
        sinCoincidencia &&
          a.jsxs("p", {
            className: "mcard__notice trips-empty",
            children: [a.jsx(He, { name: "info", size: 15 }), t("packs.q.noMonth")],
          }),
        a.jsx("div", {
          className: "trips",
          children: resultados.map((m) =>
            a.jsx(Resultado, { m, grupo, lang, t, onOpen: setAbierta }, m.id),
          ),
        }),
        a.jsx("p", {
          className: "small muted month-note",
          children: t("packs.priceNote", {
            fecha: `${El(`${comprobado}-01`, lang)} ${comprobado.slice(0, 4)}`,
          }),
        }),
        abiertaM &&
          a.jsx(
            Ficha,
            { m: abiertaM, grupo, lang, t, onClose: () => setAbierta(null), onMap: v },
            `${abiertaM.id}-${JSON.stringify(grupo)}`,
          ),
      ],
    }),
  });
}

export { Kp };
