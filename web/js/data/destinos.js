import { reales } from "./reales.js";
import { editorial, habitualesConFuente } from "./editorial.js";

const ds = "Datos proporcionados por Greenia",
  Wu = "Copernicus Sentinel-2 (estimación)",
  Zd = "Fechas históricas de fuentes públicas";

// ---------- Ayudas para construir destinos con los datos reales (reales.js) ----------
const masDias = (iso, d) =>
  new Date(Date.parse(iso + "T00:00:00Z") + d * 864e5).toISOString().slice(0, 10);
const mesDia = (iso) => iso.slice(5, 10);
const fechaCorta = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
const pct = (x) => `${Math.round(x * 100)} %`;
// Probabilidad de que un año nuevo caiga entre el mínimo y el máximo de n años observados
const coberturaHistorica = (n) => (n - 1) / (n + 1);

// Ventana a partir de fechas de referencia (mediana, mínimo y máximo de varios años).
// Si la fase aún no se ha visto en el satélite, la ventana empieza tras la última observación
// y ya no se puede dar la probabilidad histórica.
function ventanaReferencia(fase, ref, noAntesDe, fuente) {
  const desde = noAntesDe && noAntesDe > ref.min ? noAntesDe : ref.min,
    recortada = desde !== ref.min;
  return {
    fase,
    desde,
    hasta: ref.max,
    tipoDato: "previsto",
    confianza: "baja",
    probabilidad: recortada ? void 0 : coberturaHistorica(ref.anios),
    metodo: "climatologia",
    fuente: `${fuente} (${ref.anios} años)`,
  };
}
const habitualDe = (fase, ref) => ({
  fase,
  tipica: mesDia(ref.mediana),
  rangoMin: mesDia(ref.min),
  rangoMax: mesDia(ref.max),
});

// ---------- Tejera Negra ----------
const tn = reales.tejeraNegra,
  tnRef = tn.referencia,
  tnInicio = tn.hitos.find((h) => h.hito === "inicio"),
  tnUltima = tn.serie.filter((s) => s.indice !== null).at(-1),
  tnTrasObs = masDias(tn.ultimaObs, 1),
  tnClima3 = tn.clima.slice(-3),
  tnFrio = Math.min(...tnClima3.map((c) => c.tMax)),
  tnLluvia = tnClima3.reduce((s, c) => s + (c.lluvia ?? 0), 0),
  tnRefFuente = "Fechas de referencia de Greenia",
  // Igual que la tabla de fases: centro de la ventana observada frente a la fecha habitual
  tnAdelanto =
    Math.round((Date.parse(tnRef.inicio.mediana) - Date.parse(tnInicio.fecha)) / 864e5) -
    Math.round(
      (Date.parse(tnInicio.confirmado ?? tnInicio.fecha) - Date.parse(tnInicio.fecha)) / 864e5 / 2,
    ),
  tejeraNegra = {
    id: "tejera-negra",
    nombre: "Hayedo de Tejera Negra",
    lugar: "Cantalojas, Sierra de Ayllón",
    provincia: "Guadalajara",
    region: "Castilla-La Mancha",
    especie: "Haya (Fagus sylvatica)",
    fenomeno: "Color otoñal",
    tipo: "color_otonal",
    lat: 41.245,
    lon: -3.405,
    color: "#C8662B",
    ilustracion: "haya",
    temporada: "Otoño 2026",
    finTemporada: tnRef.pleno.max,
    datosReales: !0,
    estado: {
      fase: tnInicio ? "inicio" : "fuera_temporada",
      tipoDato: "estimado",
      actualizadoEn: reales.generadoEn,
      fuente: Wu,
      resumen:
        `El satélite marcó el inicio del color el ${fechaCorta(tnInicio.fecha)}, ${tnAdelanto} días antes de lo habitual` +
        `${tnInicio.revisar ? " (Greenia lo tiene pendiente de revisar)" : ""}. ` +
        `Última observación: índice ${tnUltima.indice.toLocaleString("es-ES")} el ${fechaCorta(tnUltima.fecha)} ` +
        `en ${tnUltima.zonas} de 7 zonas; aún no se ve el avance. ` +
        `Días recientes fríos (máx. ${tnFrio.toLocaleString("es-ES")} °C) y ${Math.round(tnLluvia)} mm de lluvia.`,
    },
    ventanas: [
      {
        fase: "inicio",
        desde: tnInicio.fecha,
        hasta: tnInicio.confirmado ?? tnInicio.fecha,
        tipoDato: "estimado",
        confianza: tnInicio.revisar ? "media" : "alta",
        metodo: "satelite",
        fuente: `${Wu} · hito de Greenia${tnInicio.revisar ? " pendiente de revisar" : ""}`,
      },
      ventanaReferencia("avance", tnRef.avanzado, tnTrasObs, tnRefFuente),
      ventanaReferencia("pleno", tnRef.pleno, tnTrasObs, tnRefFuente),
    ],
    habituales: [
      habitualDe("inicio", tnRef.inicio),
      habitualDe("avance", tnRef.avanzado),
      habitualDe("pleno", tnRef.pleno),
    ],
    entradasHasta: tn.clima.at(-1).fecha,
    generadaEn: reales.generadoEn,
    // Posiciones aproximadas: los CSV no traen coordenadas de las zonas
    zonas: tn.zonas.map((z, i) => ({
      id: z.id,
      nombre: `Zona ${i + 1}`,
      lat: [41.262, 41.256, 41.249, 41.243, 41.237, 41.231, 41.226][i] - 0.028,
      lon: [-3.418, -3.398, -3.425, -3.389, -3.412, -3.396, -3.42][i] + 0.012,
      indice: z.cambio,
      fecha: z.ultimaFecha,
      calidad: z.nubesEnUltimoPaso ? "nubes" : "ok",
      fase: null,
    })),
    grafica: {
      tipo: "color",
      serie: tn.serie,
      umbrales: [
        { v: 0.2, fase: "inicio" },
        { v: 0.45, fase: "avance" },
        { v: 0.7, fase: "pleno" },
      ],
    },
    clima: tn.clima.filter((c) => c.fecha >= tn.serie[0].fecha),
    umbrales: { inicio: 0.2, avance: 0.45, pleno: 0.7, final: 0.6 },
  };

// ---------- Brihuega ----------
const br = reales.brihuega,
  brT = br.temporada2026,
  brP = br.prediccion2027,
  brUltima = br.cosecha2026.at(-1),
  brFuente = `Previsión de Greenia (${brP.plena_flor.modelo}, ${brP.plena_flor.anios} años)`,
  brihuega = {
    id: "brihuega",
    nombre: "Lavanda de Brihuega",
    lugar: "Brihuega",
    provincia: "Guadalajara",
    region: "Castilla-La Mancha",
    especie: "Lavandín (Lavandula × intermedia)",
    fenomeno: "Floración",
    tipo: "floracion",
    lat: 40.76,
    lon: -2.868,
    color: "#6F4FB8",
    ilustracion: "lavanda",
    temporada: "Verano 2027",
    finTemporada: brP.cosecha_final.probable.hasta,
    datosReales: !0,
    estado: {
      fase: "fuera_temporada",
      tipoDato: "observado",
      actualizadoEn: reales.generadoEn,
      fuente: `${ds} · ${br.satelite.parcelas} parcelas vigiladas con Sentinel-2`,
      resumen:
        `Cosecha 2026 terminada: ${pct(brT.fracCortada)} de las ${Math.round(brUltima.haPlanta)} ha cortadas ` +
        `(10 % el ${fechaCorta(brT.cosecha10)}, 50 % el ${fechaCorta(brT.cosecha50)}). ` +
        `Próxima plena flor prevista hacia el ${fechaCorta(brP.plena_flor.central)} de 2027.`,
    },
    ventanas: [
      {
        fase: "pleno",
        desde: brP.plena_flor.probable.desde,
        hasta: brP.plena_flor.probable.hasta,
        amplia: brP.plena_flor.amplia,
        tipoDato: "previsto",
        confianza: "media",
        metodo: "climatologia",
        fuente: brFuente,
      },
      {
        // En la lavanda, el final de la flor es la cosecha: del 10 % cortado al final del corte
        fase: "final",
        desde: brP.cosecha_10.probable.desde,
        hasta: brP.cosecha_final.probable.hasta,
        amplia: { desde: brP.cosecha_10.amplia.desde, hasta: brP.cosecha_final.amplia.hasta },
        tipoDato: "previsto",
        confianza: "media",
        metodo: "climatologia",
        fuente: brFuente,
      },
    ],
    habituales: [
      {
        fase: "pleno",
        tipica: mesDia(brP.plena_flor.central),
        rangoMin: mesDia(brP.plena_flor.amplia.desde),
        rangoMax: mesDia(brP.plena_flor.amplia.hasta),
      },
      {
        fase: "final",
        tipica: mesDia(brP.cosecha_10.central),
        rangoMin: mesDia(brP.cosecha_10.amplia.desde),
        rangoMax: mesDia(brP.cosecha_10.amplia.hasta),
      },
    ],
    entradasHasta: brP.plena_flor.emitida,
    generadaEn: brP.plena_flor.emitida + "T00:00:00+02:00",
    grafica: {
      tipo: "cosecha",
      serie: br.cosecha2026.map((c) => ({
        fecha: c.fecha,
        indice: c.cortado,
        p25: c.cortado,
        p75: Math.min(1, c.cortado + c.probable),
      })),
      umbrales: [
        { v: 0.1, etiqueta: "10 %" },
        { v: 0.5, etiqueta: "50 %" },
      ],
    },
    umbrales: { inicio: 0.15, avance: 0.4, pleno: 0.7, final: 0.5 },
    patrocinio: {
      entidad: "[Ayuntamiento de Brihuega]",
      mensaje: "Descubre la agenda del Festival de la Lavanda 2027.",
    },
  };

// ---------- Montejo (solo fechas de referencia, sin seguimiento por satélite) ----------
const moRef = reales.montejo.referencia,
  moFuente = "Fechas de referencia de Greenia",
  montejo = {
    id: "montejo",
    nombre: "Hayedo de Montejo",
    lugar: "Montejo de la Sierra, Sierra del Rincón",
    provincia: "Madrid",
    region: "Comunidad de Madrid",
    especie: "Haya (Fagus sylvatica)",
    fenomeno: "Color otoñal",
    tipo: "color_otonal",
    lat: 41.116,
    lon: -3.5,
    color: "#B5562A",
    ilustracion: "haya",
    temporada: "Otoño 2026",
    finTemporada: moRef.pleno.max,
    datosReales: !0,
    estado: {
      fase: "fuera_temporada",
      tipoDato: "previsto",
      actualizadoEn: reales.generadoEn,
      fuente: moFuente,
      resumen:
        `Todavía sin seguimiento por satélite. Por sus fechas habituales, el color empieza hacia el ` +
        `${fechaCorta(moRef.inicio.mediana)} (entre el ${fechaCorta(moRef.inicio.min)} y el ${fechaCorta(moRef.inicio.max)}) ` +
        `y llega al pleno hacia el ${fechaCorta(moRef.pleno.mediana)}.`,
    },
    ventanas: [
      ventanaReferencia("inicio", moRef.inicio, null, moFuente),
      ventanaReferencia("avance", moRef.avanzado, null, moFuente),
      ventanaReferencia("pleno", moRef.pleno, null, moFuente),
    ],
    habituales: [
      habitualDe("inicio", moRef.inicio),
      habitualDe("avance", moRef.avanzado),
      habitualDe("pleno", moRef.pleno),
    ],
    entradasHasta: reales.hoy,
    generadaEn: reales.generadoEn,
    umbrales: { inicio: 0.2, avance: 0.45, pleno: 0.7, final: 0.6 },
  };

// ---------- Destinos sin datos de Greenia: fechas habituales con fuente (editorial.js) ----------
// Ventanas de la próxima temporada a partir del rango habitual de cada fase
const ventanasHabituales = (anio, habituales, fuente) =>
  habituales.map((h) => ({
    fase: h.fase,
    desde: `${anio}-${h.rangoMin}`,
    hasta: `${anio}-${h.rangoMax}`,
    tipoDato: "previsto",
    confianza: "baja",
    metodo: "climatologia",
    fuente,
  }));
function destinoPublico(base, anio, resumen) {
  const hab = habitualesConFuente[base.id],
    fuente = `${Zd} (${[...new Set(editorial[base.id].fuentes.map((f) => f.nombre.split(" · ")[0]))].join(", ")})`;
  return {
    ...base,
    finTemporada: `${anio}-${hab[hab.length - 1].rangoMax}`,
    datosReales: !1,
    estado: {
      fase: "fuera_temporada",
      tipoDato: "observado",
      actualizadoEn: reales.generadoEn,
      fuente: Zd,
      resumen,
    },
    ventanas: ventanasHabituales(anio, hab, fuente),
    habituales: hab,
    entradasHasta: reales.hoy,
    generadaEn: reales.generadoEn,
    umbrales: { inicio: 0.15, avance: 0.4, pleno: 0.7, final: 0.5 },
  };
}
const jerte = destinoPublico(
    {
      id: "jerte",
      nombre: "Cerezo del Valle del Jerte",
      lugar: "Valle del Jerte",
      provincia: "Cáceres",
      region: "Extremadura",
      especie: "Cerezo (Prunus avium)",
      fenomeno: "Floración",
      tipo: "floracion",
      color: "#EC6A92",
      ilustracion: "cerezo",
      temporada: "Primavera 2027",
    },
    2027,
    "Árboles en reposo invernal. La flor suele llegar entre finales de marzo y principios de abril, de abajo arriba del valle. En 2026 el bloque Cerezo en Flor fue del 27 de marzo al 12 de abril.",
  ),
  alpujarra = destinoPublico(
    {
      id: "alpujarra",
      nombre: "Almendro de la Alpujarra",
      lugar: "La Alpujarra y la Contraviesa (Torvizcón)",
      provincia: "Granada",
      region: "Andalucía",
      especie: "Almendro (Prunus dulcis)",
      fenomeno: "Floración",
      tipo: "floracion",
      color: "#F2A7BC",
      ilustracion: "almendro",
      temporada: "Invierno 2027",
    },
    2027,
    "Sin flor. Los almendros de la Alpujarra suelen florecer de mediados de enero a marzo, con el mejor momento hacia finales de febrero.",
  ),
  tejeda = destinoPublico(
    {
      id: "tejeda",
      nombre: "Almendro en flor de Tejeda",
      lugar: "Tejeda, cumbre de Gran Canaria",
      provincia: "Las Palmas",
      region: "Canarias",
      especie: "Almendro (Prunus dulcis)",
      fenomeno: "Floración",
      tipo: "floracion",
      lat: 27.995,
      lon: -15.615,
      color: "#F2A7BC",
      ilustracion: "almendro",
      temporada: "Invierno 2027",
    },
    2027,
    "Sin flor. Los almendros de Tejeda florecen entre enero y febrero. En 2026 las Fiestas del Almendro en Flor fueron del 31 de enero al 8 de febrero.",
  ),
  teide = destinoPublico(
    {
      id: "teide",
      nombre: "Tajinaste rojo del Teide",
      lugar: "Parque Nacional del Teide, Tenerife",
      provincia: "Santa Cruz de Tenerife",
      region: "Canarias",
      especie: "Tajinaste rojo (Echium wildpretii)",
      fenomeno: "Floración",
      tipo: "floracion",
      lat: 28.225,
      lon: -16.63,
      color: "#C4314B",
      ilustracion: "lavanda",
      temporada: "Primavera 2027",
    },
    2027,
    "Sin flor. El tajinaste rojo florece en mayo y junio; lo mejor suele ir de mediados de mayo a principios de junio.",
  );

// Cada destino se completa con lo que cuenta (editorial.js) y sus fuentes.
// Las coordenadas verificadas de editorial.js sustituyen a las aproximadas.
const conEditorial = (d) => {
    const e = editorial[d.id];
    return {
      ...d,
      lat: e.lat ?? d.lat,
      lon: e.lon ?? d.lon,
      editorial: e.texto,
      fuentes: e.fuentes,
    };
  },
  Ot = [tejeraNegra, brihuega, montejo, tejeda, teide, jerte, alpujarra].map(conEditorial),
  oo = (f) => Ot.find((v) => v.id === f);

export { Ot, oo };
