// MOCK destination data, shaped like GET /destinos/{id} (spec §9.1).
// Tejera Negra and Brihuega use the organisers' datasets (datosOrganizadores.ts, generated from
// origin/*.csv). The other destinations and all texts come from the team's site (datosEquipo.ts).
import type { Destino } from './tipos';
import { previsionTejeraNegra, serieTejeraNegra } from './series';
import { BRIHUEGA, TEJERA_NEGRA, TN_ZONAS } from './datosOrganizadores';
import { DESTINOS_EQUIPO, TEXTOS_EQUIPO } from './datosEquipo';

const PROPORCIONADO = 'Datos proporcionados por Greenia';
const REFERENCIA = 'Fechas de referencia de Greenia (8 temporadas)';
const PREDICCION_BR = `Predicción de Greenia (${BRIHUEGA.prediccion.plena_flor.modelo}, ${BRIHUEGA.prediccion.plena_flor.anios} años)`;
const MODELO = 'Modelo Cuándo Florece v0 (simulado)';

const TN = TEJERA_NEGRA;
const BR = BRIHUEGA.prediccion;
const coma = (n: number) => n.toFixed(2).replace('.', ',');
const pct = (n: number) => `${Math.round(n * 100)} %`;

const PROPIOS: Destino[] = [
  {
    id: 'tejera-negra',
    nombre: 'Hayedo de Tejera Negra',
    lugar: 'Cantalojas, Sierra de Ayllón',
    provincia: 'Guadalajara',
    region: 'Castilla-La Mancha',
    especie: 'Haya (Fagus sylvatica)',
    fenomeno: 'Color otoñal',
    tipo: 'color_otonal',
    lat: 41.245,
    lon: -3.405,
    color: '#C8662B',
    ilustracion: 'haya',
    temporada: 'Otoño 2026',
    finTemporada: '2026-11-25',
    datosReales: true,
    estado: {
      fase: 'inicio',
      tipoDato: 'observado',
      actualizadoEn: `${TN.ultima.fecha}T12:00:00+02:00`,
      fuente: PROPORCIONADO,
      resumen: `Índice de color ${coma(TN.ultima.indice)} (${TN.ultima.zonasConDato} de 7 zonas con dato). El cambio de color empezó el 4 de septiembre y aún no llega al umbral de avance (${coma(TN.umbrales.avance)}).`,
    },
    ventanas: [
      { fase: 'inicio', desde: TN.hitoInicio.fecha, hasta: TN.hitoInicio.confirmado, tipoDato: 'observado', confianza: 'media', probabilidad: 0.8, metodo: 'dato_proporcionado', fuente: PROPORCIONADO },
      { fase: 'avance', desde: '2026-10-21', hasta: `2026-${TN.referencia.avance.rangoMax}`, tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'dato_proporcionado', fuente: REFERENCIA },
      { fase: 'pleno', desde: '2026-10-26', hasta: '2026-11-08', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: MODELO },
      { fase: 'final', desde: '2026-11-09', hasta: '2026-11-22', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: MODELO },
    ],
    habituales: [
      { fase: 'inicio', tipica: TN.referencia.inicio.tipica, rangoMin: TN.referencia.inicio.rangoMin, rangoMax: TN.referencia.inicio.rangoMax },
      { fase: 'avance', tipica: TN.referencia.avance.tipica, rangoMin: TN.referencia.avance.rangoMin, rangoMax: TN.referencia.avance.rangoMax },
      { fase: 'pleno', tipica: TN.referencia.pleno.tipica, rangoMin: TN.referencia.pleno.rangoMin, rangoMax: TN.referencia.pleno.rangoMax },
      { fase: 'final', tipica: '11-14', rangoMin: '11-05', rangoMax: '11-24' },
    ],
    entradasHasta: TN.ultima.fecha,
    generadaEn: '2026-10-20T06:30:00+02:00',
    zonas: TN_ZONAS,
    serie: serieTejeraNegra(),
    serieprevision: previsionTejeraNegra(),
    umbrales: TN.umbrales,
    editorial: {
      historia:
        'Uno de los hayedos más meridionales de Europa, refugio de un bosque que necesita frío y humedad. Está en el Parque Natural de la Sierra Norte de Guadalajara, entre pizarras y arroyos de montaña.',
      queVer: ['Senda de Carretas, el paseo corto por el corazón del hayedo', 'Senda del Robledal, la ruta larga hasta el Collado de la Quesera', 'Arquitectura negra de pizarra en los pueblos de la sierra'],
      comoLlegar: 'Desde Madrid, unas 2 h 15 min por la A-1 hasta Riaza y la carretera de Cantalojas. El último tramo es pista forestal.',
      acceso:
        'Espacio natural protegido. En otoño el acceso en vehículo puede estar limitado y requerir reserva previa: consúltalo antes de ir.',
      consejos: ['Ve entre semana: los fines de semana de pleno color se completa el aforo.', 'Lleva calzado de montaña; las sendas tienen barro tras la lluvia.'],
    },
  },
  {
    id: 'brihuega',
    nombre: 'Lavanda de Brihuega',
    lugar: 'Brihuega',
    provincia: 'Guadalajara',
    region: 'Castilla-La Mancha',
    especie: 'Lavandín (Lavandula × intermedia)',
    fenomeno: 'Floración',
    tipo: 'floracion',
    lat: 40.76,
    lon: -2.868,
    color: '#6F4FB8',
    ilustracion: 'lavanda',
    temporada: 'Verano 2027',
    finTemporada: BR.cosecha_final.probableHasta,
    datosReales: true,
    estado: {
      fase: 'fuera_temporada',
      tipoDato: 'observado',
      actualizadoEn: '2026-09-29T12:00:00+02:00',
      fuente: PROPORCIONADO,
      resumen: `Temporada 2026 cerrada: el 10 % del lavandín se cortó el 21 de julio y el 50 % el 11 de agosto (${pct(BRIHUEGA.temporada2026.fracCortada)} de ${Math.round(BRIHUEGA.haPlanta)} ha cosechado). Plena flor prevista del 1 al 8 de julio de 2027.`,
    },
    ventanas: [
      { fase: 'inicio', desde: '2027-06-12', hasta: '2027-06-24', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: MODELO },
      { fase: 'avance', desde: BR.plena_flor.ampliaDesde, hasta: '2027-06-30', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'dato_proporcionado', fuente: PREDICCION_BR },
      { fase: 'pleno', desde: BR.plena_flor.probableDesde, hasta: BR.plena_flor.probableHasta, tipoDato: 'previsto', confianza: 'media', probabilidad: 0.8, metodo: 'dato_proporcionado', fuente: PREDICCION_BR },
      { fase: 'final', desde: BR.cosecha_10.probableDesde, hasta: BR.cosecha_10.probableHasta, tipoDato: 'previsto', confianza: 'media', probabilidad: 0.8, metodo: 'dato_proporcionado', fuente: PREDICCION_BR },
    ],
    habituales: [
      { fase: 'inicio', tipica: '06-15', rangoMin: '06-05', rangoMax: '06-25' },
      { fase: 'avance', tipica: '06-25', rangoMin: '06-15', rangoMax: '07-05' },
      { fase: 'pleno', tipica: BR.plena_flor.central.slice(5), rangoMin: BR.plena_flor.ampliaDesde.slice(5), rangoMax: BR.plena_flor.ampliaHasta.slice(5) },
      { fase: 'final', tipica: BR.cosecha_10.central.slice(5), rangoMin: BR.cosecha_10.ampliaDesde.slice(5), rangoMax: BR.cosecha_10.ampliaHasta.slice(5) },
    ],
    entradasHasta: '2026-09-29',
    generadaEn: '2026-10-20T06:30:00+02:00',
    umbrales: { inicio: 0.15, avance: 0.4, pleno: 0.7, final: 0.5 },
    editorial: {
      historia:
        'Alrededor de la villa amurallada de Brihuega se extienden cientos de hectáreas de lavandín. En julio el aroma llega hasta el casco histórico y el pueblo celebra su Festival de la Lavanda.',
      queVer: ['Campos de lavanda al atardecer', 'Jardines de la Real Fábrica de Paños', 'Murallas y Castillo de la Peña Bermeja'],
      comoLlegar: 'A 1 h desde Madrid por la A-2, salida hacia Brihuega.',
      acceso: 'La mayoría de los campos son fincas privadas: respeta las lindes y no entres en las parcelas.',
      consejos: ['La cosecha empieza a finales de julio; después los campos quedan sin flor.', 'Las mejores horas son el amanecer y el atardecer.'],
    },
    patrocinio: { entidad: '[Ayuntamiento de Brihuega]', mensaje: 'Descubre la agenda del Festival de la Lavanda 2027.' },
  },
];

// The team's site wins on content: its texts (with cited sources) replace ours for every destination,
// and its extra destinations come in whole, in the team's order.
const ORDEN = ['tejera-negra', 'brihuega', 'montejo', 'tejeda', 'teide', 'jerte', 'alpujarra'];
export const DESTINOS: Destino[] = [...PROPIOS, ...DESTINOS_EQUIPO]
  .map((d) => ({ ...d, editorial: TEXTOS_EQUIPO[d.id]?.editorial ?? d.editorial }))
  .sort((a, b) => ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id));

export const fuentesDe = (id: string) => TEXTOS_EQUIPO[id]?.fuentes ?? [];

export const getDestino = (id: string) => DESTINOS.find((d) => d.id === id);
