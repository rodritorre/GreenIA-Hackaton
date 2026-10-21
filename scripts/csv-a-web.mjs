// Convierte los CSV de Greenia (carpeta origin/) en web/js/data/reales.js.
// Uso: node scripts/csv-a-web.mjs  (volver a ejecutar cada vez que lleguen CSV nuevos)
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const dirCsv = path.join(raiz, "origin");
const salida = path.join(raiz, "web/js/data/reales.js");

// ---------- utilidades ----------
function leerCsv(nombre) {
  const [cabecera, ...filas] = fs.readFileSync(path.join(dirCsv, nombre), "utf8").trim().split(/\r?\n/);
  const cols = cabecera.split(",");
  return filas.map((l) => {
    const v = l.split(",");
    return Object.fromEntries(cols.map((c, i) => [c, v[i] ?? ""]));
  });
}
const num = (s) => (s === "" || s === undefined ? null : Number(s));
const r3 = (x) => (x === null ? null : Math.round(x * 1000) / 1000);
const mediana = (a) => {
  const s = [...a].sort((x, y) => x - y), n = s.length;
  return n === 0 ? null : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const sumarDias = (iso, d) => new Date(Date.parse(iso + "T00:00:00Z") + d * 864e5).toISOString().slice(0, 10);
// Día del año (1 = 1 de enero) a fecha ISO del año indicado
const doyAFecha = (anio, doy) => sumarDias(`${anio}-01-01`, Math.round(doy) - 1);

// ---------- Tejera Negra (otoño) ----------
const avance = leerCsv("otono_avance_tejera_negra.csv").map((r) => ({
  fecha: r.fecha,
  zonas: num(r.zonas),
  indice: num(r.color),
  p25: num(r.color_p25),
  p75: num(r.color_p75),
  hojaPerdida: num(r.hoja_perdida),
}));

const s2 = leerCsv("s2_otono_tejera_negra.csv").map((r) => ({
  zona: r.parcela,
  fecha: r.fecha,
  frac: num(r.frac_valida),
  B03: num(r.B03),
  B04: num(r.B04),
}));
const pasos = [...new Set(s2.map((r) => r.fecha))].sort();

// Pasos del satélite sin ningún dato válido (nubes): huecos en la serie, nunca se rellenan
const fechasAvance = new Set(avance.map((r) => r.fecha));
const pasosNublados = pasos.filter((f) => f >= avance[0].fecha && !fechasAvance.has(f));
const serieColor = [
  ...avance,
  ...pasosNublados.map((fecha) => ({ fecha, zonas: 0, indice: null, p25: null, p75: null })),
].sort((a, b) => a.fecha.localeCompare(b.fecha));

// Por zona: cambio de color respecto a julio (cálculo propio, (B04-B03)/(B04+B03)).
// El índice de Greenia es por píxel y no se puede reproducir con estos agregados.
const rojoVerde = (r) => (r.B04 - r.B03) / (r.B04 + r.B03);
const validas = s2.filter((r) => r.frac >= 0.5 && r.B04 !== null);
const zonasIds = [...new Set(s2.map((r) => r.zona))].sort();
const ultimaObs = avance.at(-1).fecha;
const zonas = zonasIds.map((id) => {
  const propias = validas.filter((r) => r.zona === id);
  const base = mediana(propias.filter((r) => r.fecha <= "2026-07-31").map(rojoVerde));
  const ultimaFecha = propias.at(-1)?.fecha ?? null;
  const ultimas = propias.filter((r) => r.fecha === ultimaFecha);
  return {
    id,
    ultimaFecha,
    fracValida: ultimas.length ? r3(Math.max(...ultimas.map((r) => r.frac))) : null,
    cambio: ultimas.length && base !== null ? r3(mediana(ultimas.map(rojoVerde)) - base) : null,
    nubesEnUltimoPaso: ultimaFecha !== ultimaObs,
  };
});

const clima = leerCsv("otono_clima_tejera_negra.csv")
  .map((r) => ({ fecha: r.fecha, tMax: num(r.tmax), tMin: num(r.tmin), lluvia: num(r.lluvia) }))
  .filter((r, i, a) => a.slice(0, i + 1).some((x) => x.tMax !== null)); // desde el primer dato

const hitos = leerCsv("otono_hitos.csv").map((r) => ({
  hayedo: r.hayedo,
  hito: r.hito,
  fecha: r.fecha,
  confirmado: r.confirmado || null,
  revisar: r.revisar === "True",
}));

const referencia = {};
for (const r of leerCsv("referencia_fechas.csv")) {
  (referencia[r.hayedo] ||= {})[r.hito] = {
    anios: num(r.anios),
    mediana: doyAFecha(2026, num(r.doy_mediana)),
    min: doyAFecha(2026, num(r.doy_min)),
    max: doyAFecha(2026, num(r.doy_max)),
  };
}

// ---------- Brihuega (lavanda) ----------
const cosecha2026 = leerCsv("avance_brihuega.csv").map((r) => ({
  fecha: r.fecha,
  cortado: num(r.pct_cortado),
  probable: num(r.pct_probable),
  haCortadas: num(r.ha_cortadas),
  haPlanta: num(r.ha_planta),
}));
const [t] = leerCsv("temporada_brihuega.csv");
const temporada2026 = {
  anio: num(t.anio),
  cosecha10: t.cosecha_10,
  cosecha50: t.cosecha_50,
  cosechaFinal: t.cosecha_final,
  fracCortada: num(t.frac_cortada),
  directo: { cosecha10: t.cosecha_10_directo, cosecha50: t.cosecha_50_directo, fracCortada: num(t.frac_cortada_directo) },
};
const prediccion2027 = {};
for (const r of leerCsv("prediccion_2027_brihuega.csv")) {
  prediccion2027[r.hito] = {
    emitida: r.fecha_emision,
    central: r.central,
    probable: { desde: r.probable_desde, hasta: r.probable_hasta },
    amplia: { desde: r.amplia_desde, hasta: r.amplia_hasta },
    anios: num(r.anios),
    modelo: r.version_modelo,
  };
}
// s2_brihuega.csv es grande: solo resumimos qué cubre
const s2b = fs.readFileSync(path.join(dirCsv, "s2_brihuega.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(","));
const parcelas = new Map(s2b.map((c) => [c[0], c[1]]));
const fechasB = [...new Set(s2b.map((c) => c[2]))].sort();
const satBrihuega = {
  parcelas: parcelas.size,
  lavandin: [...parcelas.values()].filter((v) => v === "lavandin").length,
  lavandaFina: [...parcelas.values()].filter((v) => v === "lavanda_fina").length,
  pasos: fechasB.length,
  desde: fechasB[0],
  hasta: fechasB.at(-1),
};

// ---------- escribir ----------
const hoy = new Date().toISOString().slice(0, 10);
const datos = {
  generadoEn: new Date().toISOString(),
  hoy,
  tejeraNegra: {
    serie: serieColor,
    clima,
    zonas,
    ultimaObs,
    ultimoPaso: pasos.at(-1),
    hitos: hitos.filter((h) => h.hayedo === "tejera_negra"),
    referencia: referencia.tejera_negra,
  },
  montejo: { referencia: referencia.montejo },
  brihuega: { cosecha2026, temporada2026, prediccion2027, satelite: satBrihuega },
};
fs.writeFileSync(
  salida,
  `// GENERADO por scripts/csv-a-web.mjs a partir de origin/*.csv. No editar a mano.\n` +
    `const reales = ${JSON.stringify(datos, null, 2)};\n\nexport { reales };\n`,
);
console.log("Escrito", path.relative(raiz, salida));
console.log("Tejera Negra:", serieColor.length, "pasos,", pasosNublados.length, "nublados, última obs.", ultimaObs);
console.log("Brihuega:", cosecha2026.length, "fechas de cosecha,", satBrihuega.parcelas, "parcelas");
