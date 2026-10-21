import { a, ce } from "../vendor/react.min.js";
import { tt } from "../i18n.js";
import { He } from "../components/icons.js";
import { jl } from "../data/ofertas.js";
import { El, Ho, Us, ah, lh, sh } from "../utils/fechas.js";
import { Ot, oo } from "../data/destinos.js";
import { hh, zr } from "../components/ui.js";
import { Df, Vu, ph, qt } from "../utils/fases.js";
import { ja } from "../vendor/leaflet.min.js";
import { Yu } from "../vendor/react-dom-server.min.js";
import { Sh, ap, fp, kl, up } from "../vendor/react-leaflet.min.js";
import { gp, vp } from "../data/geo.js";

const Uu = new Map();
function _p(f) {
  return (
    Uu.has(f) ||
      Uu.set(
        f,
        fetch(`./data/sat/${f}`)
          .then((v) => (v.ok ? v.json() : {}))
          .catch(() => ({})),
      ),
    Uu.get(f)
  );
}
class Kd extends ja.GridLayer {
  constructor(v, m) {
    (super(m), (this.fileFor = v));
  }
  _initTile(v) {
    super._initTile(v);
    const m = this.getTileSize();
    ((v.style.width = m.x + 0.5 + "px"), (v.style.height = m.y + 0.5 + "px"));
  }
  createTile(v, m) {
    const j = document.createElement("img");
    return (
      (j.alt = ""),
      (j.className = "sat-tile"),
      j.setAttribute("role", "presentation"),
      (j.style.visibility = "hidden"),
      _p(this.fileFor(v.z)).then((T) => {
        const S = T[`${v.z}/${v.x}/${v.y}`];
        if (!S) return m(void 0, j);
        ((j.onload = () => {
          ((j.style.visibility = ""), m(void 0, j));
        }),
          (j.onerror = () => m(void 0, j)),
          (j.src = S));
      }),
      j
    );
  }
}
const yp = "Contains modified Copernicus Sentinel-2 data (2025) · Natural Earth";
function xp() {
  const f = Sh();
  return (
    ce.useEffect(() => {
      const v = new Kd((j) => (j <= 8 ? "base-z5-8.json" : "base-z9.json"), {
          minNativeZoom: 5,
          maxNativeZoom: 9,
          className: "sat",
          attribution: yp,
        }),
        m = new Kd(() => "detail.json", { minZoom: 10, maxNativeZoom: 14, className: "sat" }),
        hi = ja.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            minZoom: 10,
            maxZoom: 18,
            maxNativeZoom: 18,
            keepBuffer: 4,
            attribution: "Ortofoto © Esri, Maxar, Earthstar Geographics",
          },
        ),
        lb = ja.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          { minZoom: 10, maxZoom: 18, maxNativeZoom: 18 },
        );
      _p("base-z9.json");
      return (
        v.addTo(f),
        m.addTo(f),
        hi.addTo(f),
        lb.addTo(f),
        () => {
          (v.remove(), m.remove(), hi.remove(), lb.remove());
        }
      );
    }, [f]),
    null
  );
}
const qu = "tejera-negra";
function wp(f, v) {
  return ja.divIcon({
    html: `<span class="city${v ? " city--capital" : ""}"><i></i>${f}</span>`,
    className: "mk-wrap",
    iconSize: [0, 0],
    iconAnchor: [4, 4],
  });
}
function kp(f, v, m) {
  const { e: j, d: T } = f,
    S = hh[j.fase],
    M = Yu.renderToStaticMarkup(
      a.jsxs("div", {
        className: `mk ${v ? "mk--sel" : ""} ${j.esPrevision ? `mk--conf-${j.confianza}` : ""}`,
        children: [
          j.fase === "pleno" && a.jsx("span", { className: "mk__pulse" }),
          j.esPrevision && a.jsx("span", { className: "mk__halo" }),
          a.jsx(zr, { fase: j.fase }),
          v && a.jsx("span", { className: "mk__tip", children: T.nombre }),
          a.jsx("span", { className: "sr-only", children: m }),
        ],
      }),
    ),
    b = S + 16;
  return ja.divIcon({
    html: M,
    className: "mk-wrap",
    iconSize: [b, b],
    iconAnchor: [b / 2, b / 2],
  });
}
function Sp(f, v, m) {
  const j = Yu.renderToStaticMarkup(
    a.jsxs("div", {
      className: `zone ${f === null ? "zone--nodata" : ""}`,
      children: [
        a.jsx(zr, { fase: v ?? "fuera_temporada", size: 18 }),
        a.jsx("span", { className: "zone__label", children: m }),
      ],
    }),
  );
  return ja.divIcon({ html: j, className: "mk-wrap", iconSize: [90, 24], iconAnchor: [9, 12] });
}
const jp = ja.divIcon({
  html: Yu.renderToStaticMarkup(
    a.jsx("div", { className: "photo-pin", children: a.jsx(He, { name: "camera", size: 14 }) }),
  ),
  className: "mk-wrap",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});
function Cp({ sel: f, showZones: v }) {
  const m = Sh(),
    { t: j } = tt(),
    T = ce.useRef(!0);
  return (
    ce.useEffect(() => {
      if (T.current) {
        T.current = !1;
        return;
      }
      if (v) {
        const S = oo(qu);
        m.flyTo([S.lat, S.lon], 12, { duration: 0.8 });
      } else if (f) {
        const S = oo(f);
        m.flyTo([S.lat, S.lon], Math.max(m.getZoom(), 8), { duration: 0.8 });
      } else m.flyToBounds(Vu, { duration: 0.8 });
    }, [f, v, m]),
    a.jsxs("div", {
      className: "map-zoom",
      children: [
        a.jsx("button", {
          type: "button",
          "aria-label": j("map.zoomIn"),
          onClick: () => m.zoomIn(),
          children: a.jsx(He, { name: "plus" }),
        }),
        a.jsx("button", {
          type: "button",
          "aria-label": j("map.zoomOut"),
          onClick: () => m.zoomOut(),
          children: a.jsx(He, { name: "minus" }),
        }),
        a.jsx("button", {
          type: "button",
          "aria-label": j("map.reset"),
          onClick: () => m.flyToBounds(Vu, { duration: 0.8 }),
          children: a.jsx(He, { name: "expand" }),
        }),
      ],
    })
  );
}
function Pp(f) {
  const { t: v, lang: m } = tt(),
    j = oo(qu),
    T = ce.useMemo(
      () =>
        f.items.map((S) => {
          const M = `${S.d.nombre}: ${v(`fase.${S.d.tipo}.${S.e.fase}`)}${S.e.esPrevision ? ` (${v("map.modeForecast")}, ${v(`confianza.${S.e.confianza}`)})` : ""}`;
          return { it: S, label: M, icon: kp(S, f.sel === S.d.id, M) };
        }),
      [f.items, f.sel, v],
    );
  return a.jsxs("div", {
    className: "map-frame",
    children: [
      a.jsxs(up, {
        bounds: Vu,
        minZoom: 5,
        maxZoom: 18,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        maxBounds: [
          [33, -14],
          [46.5, 8],
        ],
        zoomControl: !1,
        scrollWheelZoom: !1,
        className: "map",
        attributionControl: !0,
        children: [
          a.jsx(fp, {
            name: "fallback",
            style: { zIndex: 150 },
            children: a.jsx(ap, {
              data: vp,
              style: () => ({ fillColor: "#8C8A74", fillOpacity: 1, color: "#8C8A74", weight: 1 }),
              interactive: !1,
            }),
          }),
          a.jsx(xp, {}),
          f.showCities &&
            gp.map((S) =>
              a.jsx(
                kl,
                {
                  position: [S.lat, S.lon],
                  icon: wp(S.nombre, S.capital),
                  interactive: !1,
                  keyboard: !1,
                },
                S.nombre,
              ),
            ),
          T.map(({ it: S, label: M, icon: b }) =>
            a.jsx(
              kl,
              {
                position: [S.d.lat, S.d.lon],
                icon: b,
                title: M,
                zIndexOffset: f.sel === S.d.id ? 1e3 : S.e.fase === "pleno" ? 500 : 0,
                eventHandlers: { click: () => f.onSelect(S.d.id) },
              },
              S.d.id,
            ),
          ),
          f.showZones &&
            j.zonas.map((S) =>
              a.jsx(
                kl,
                {
                  position: [S.lat, S.lon],
                  keyboard: !1,
                  icon: Sp(
                    S.indice,
                    S.fase,
                    S.indice === null
                      ? `${S.nombre} · ${v("ficha.noData")}`
                      : `${S.nombre} · ${S.indice.toFixed(2).replace(".", m === "es" ? "," : ".")}`,
                  ),
                  title:
                    S.indice === null
                      ? v("map.zoneNoData", { zona: S.nombre })
                      : v("map.zoneLabel", { zona: S.nombre, valor: S.indice }),
                  eventHandlers: { click: () => f.onSelect(qu) },
                },
                S.id,
              ),
            ),
          f.showPhotos &&
            jl
              .filter((S) => S.estado === "valida")
              .map((S) =>
                a.jsx(
                  kl,
                  {
                    position: [S.lat, S.lon],
                    icon: jp,
                    keyboard: !1,
                    title: v("map.photoLabel", {
                      fase: v(`fase.short.${S.faseReportada}`),
                      when: Ho(S.capturadaEn, m),
                    }),
                  },
                  S.id,
                ),
              ),
          a.jsx(Cp, { sel: f.sel, showZones: f.showZones }),
        ],
      }),
      a.jsxs("div", {
        className: "map-status",
        children: [
          a.jsx("span", {
            className: `map-status__badge ${f.esPrevision ? "is-forecast" : ""}`,
            children: f.esPrevision ? v("map.badgeForecast") : v("map.badgeNow"),
          }),
          a.jsxs("span", {
            className: "map-status__text",
            children: [
              sh(f.fecha, m),
              " · ",
              v("map.summary", { active: f.activos, off: f.items.length - f.activos }).split(
                " · ",
              )[0],
            ],
          }),
          a.jsx("span", {
            className: "map-status__upd",
            children: v("map.updated", { when: Ho(Df, m) }),
          }),
        ],
      }),
      a.jsxs("fieldset", {
        className: "map-layers",
        children: [
          a.jsxs("legend", {
            children: [a.jsx(He, { name: "layers", size: 16 }), v("map.layers")],
          }),
          a.jsxs("label", {
            children: [
              a.jsx("input", {
                type: "checkbox",
                checked: f.showZones,
                onChange: (S) => f.onToggleZones(S.target.checked),
              }),
              v("map.layerZones"),
            ],
          }),
          a.jsxs("label", {
            children: [
              a.jsx("input", {
                type: "checkbox",
                checked: f.showCities,
                onChange: (S) => f.onToggleCities(S.target.checked),
              }),
              v("map.layerCities"),
            ],
          }),
          a.jsxs("label", {
            children: [
              a.jsx("input", {
                type: "checkbox",
                checked: f.showPhotos,
                onChange: (S) => f.onTogglePhotos(S.target.checked),
              }),
              v("map.layerPhotos"),
            ],
          }),
        ],
      }),
      f.esPrevision &&
        a.jsxs("p", {
          className: "map-forecast-note",
          children: [
            a.jsx("span", { "aria-hidden": "true", className: "legend__ring" }),
            v("map.forecastNote"),
          ],
        }),
    ],
  });
}
function Ep({ fecha: f, onChange: v }) {
  const { t: m, lang: j } = tt(),
    T = Array.from({ length: 12 }, (b, C) => lh(ah(qt), C)),
    S = f.slice(0, 7),
    M = Us(qt, 364);
  return a.jsxs("div", {
    className: "date-selector",
    children: [
      a.jsx("div", {
        role: "group",
        "aria-label": m("map.chooseMonth"),
        className: "month-strip",
        children: T.map((b, C) => {
          const O = Number(b.slice(0, 4)),
            ne = Number(b.slice(5, 7)),
            J = Ot.filter((Pe) => ph(Pe, O, ne) > 0).length,
            ae = b.slice(0, 7) === S,
            me = C === 0 ? qt : b.slice(0, 8) + "15";
          return a.jsxs(
            "button",
            {
              type: "button",
              className: "month",
              "aria-pressed": ae,
              onClick: () => v(me),
              children: [
                a.jsxs("span", {
                  className: "month__label",
                  children: [
                    El(b, j, "short").replace(".", ""),
                    C === 0 &&
                      a.jsx("span", { className: "month__now", children: m("map.badgeNow") }),
                  ],
                }),
                a.jsxs("span", {
                  className: "month__sub",
                  children: [O, " · ", m("map.inSeason", { n: J })],
                }),
              ],
            },
            b,
          );
        }),
      }),
      a.jsxs("div", {
        className: "date-exact",
        children: [
          a.jsx("button", {
            type: "button",
            className: "btn btn--ghost btn--sm",
            onClick: () => v(qt),
            disabled: f === qt,
            children: m("map.today"),
          }),
          a.jsxs("label", {
            className: "date-exact__field",
            children: [
              a.jsx("span", { children: m("map.exactDate") }),
              a.jsx("input", {
                type: "date",
                value: f,
                min: qt,
                max: M,
                onChange: (b) => b.target.value && v(b.target.value),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export { Ep, Pp };
