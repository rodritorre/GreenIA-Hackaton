import { reales } from "./reales.js";

const fechaCorta = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

// Sin ofertas, fotos ni suscripciones de ejemplo: se rellenan con datos reales cuando existan.
const wa = [],
  jl = [],
  wf = [
    {
      id: "greenia",
      nombre: "Datos proporcionados (Greenia)",
      tipo: "proporcionado",
      ultimaCarga: reales.generadoEn,
      estado: "ok",
      detalle:
        "9 CSV: Tejera Negra (color, clima, hitos), fechas de referencia (Tejera Negra y Montejo) y Brihuega (cosecha 2026 y previsión 2027).",
    },
    {
      id: "sentinel",
      nombre: "Copernicus Sentinel-2",
      tipo: "satelite",
      ultimaCarga: reales.tejeraNegra.ultimoPaso + "T12:00:00+02:00",
      estado:
        reales.tejeraNegra.ultimoPaso === reales.tejeraNegra.ultimaObs ? "ok" : "desactualizado",
      detalle:
        reales.tejeraNegra.ultimoPaso === reales.tejeraNegra.ultimaObs
          ? "Último paso con datos válidos."
          : `Último paso (${fechaCorta(reales.tejeraNegra.ultimoPaso)}) con nubes en todas las zonas. Se mantiene el último dato válido (${fechaCorta(reales.tejeraNegra.ultimaObs)}).`,
    },
    {
      id: "aemet",
      nombre: "AEMET OpenData",
      tipo: "meteo",
      ultimaCarga: reales.tejeraNegra.clima.at(-1).fecha + "T06:00:00+02:00",
      estado: "desactualizado",
      detalle: "Aún sin conectar: las máximas de Tejera Negra vienen en los CSV de Greenia.",
    },
    {
      id: "editorial",
      nombre: "Contenido de los destinos",
      tipo: "editorial",
      ultimaCarga: "2026-10-15T10:00:00+02:00",
      estado: "ok",
      detalle: "Historia, qué ver, accesos y consejos.",
    },
  ],
  kf = [
    { hora: "06:00", nivel: "info", mensaje: "Lectura de origin/*.csv (scripts/csv-a-web.mjs)" },
    {
      hora: "06:01",
      nivel: "info",
      mensaje: `Tejera Negra: ${reales.tejeraNegra.serie.length} pasos de Sentinel-2, ${reales.tejeraNegra.clima.length} días de clima`,
    },
    {
      hora: "06:01",
      nivel: "warn",
      mensaje: `Sentinel-2: ${reales.tejeraNegra.serie.filter((p) => p.indice === null).length} pasos sin ninguna zona válida → "sin dato" (no se interpola)`,
    },
    {
      hora: "06:02",
      nivel: "info",
      mensaje: `Brihuega: ${reales.brihuega.satelite.parcelas} parcelas, ${reales.brihuega.satelite.pasos} pasos de satélite`,
    },
  ],
  Sf = [],
  oh = 864e5,
  Zo = (f) => new Date(f.slice(0, 10) + "T00:00:00Z");

export { Sf, Zo, jl, kf, oh, wa, wf };
