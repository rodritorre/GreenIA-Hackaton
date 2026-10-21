// MOCK destination data, shaped like GET /destinos/{id} (spec §9.1).
// Tejera Negra and Brihuega use the organisers' datasets (datosOrganizadores.ts, generated from
// data/organizadores/*.csv). Jerte has historical dates only; the Alpujarra is "coming soon".
import type { Destino } from './tipos';
import { previsionTejeraNegra, serieTejeraNegra } from './series';
import { BRIHUEGA, TEJERA_NEGRA, TN_ZONAS } from './datosOrganizadores';

const PROPORCIONADO = 'Datos proporcionados por Greenia';
const REFERENCIA = 'Fechas de referencia de Greenia (8 temporadas)';
const PREDICCION_BR = `Predicción de Greenia (${BRIHUEGA.prediccion.plena_flor.modelo}, ${BRIHUEGA.prediccion.plena_flor.anios} años)`;
const MODELO = 'Modelo Cuándo Florece v0 (simulado)';
const HISTORICO = 'Fechas históricas de fuentes públicas';

const TN = TEJERA_NEGRA;
const BR = BRIHUEGA.prediccion;
const coma = (n: number) => n.toFixed(2).replace('.', ',');
const pct = (n: number) => `${Math.round(n * 100)} %`;

export const DESTINOS: Destino[] = [
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
  {
    id: 'jerte',
    nombre: 'Cerezo del Valle del Jerte',
    lugar: 'Valle del Jerte',
    provincia: 'Cáceres',
    region: 'Extremadura',
    especie: 'Cerezo (Prunus avium)',
    fenomeno: 'Floración',
    tipo: 'floracion',
    lat: 40.19,
    lon: -5.8,
    color: '#EC6A92',
    ilustracion: 'cerezo',
    temporada: 'Primavera 2027',
    finTemporada: '2027-04-30',
    datosReales: false,
    estado: {
      fase: 'fuera_temporada',
      tipoDato: 'observado',
      actualizadoEn: '2026-10-20T07:00:00+02:00',
      fuente: HISTORICO,
      resumen: 'Árboles en reposo invernal. La floración suele empezar a finales de marzo.',
    },
    ventanas: [
      { fase: 'inicio', desde: '2027-03-12', hasta: '2027-03-26', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
      { fase: 'avance', desde: '2027-03-20', hasta: '2027-04-03', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
      { fase: 'pleno', desde: '2027-03-28', hasta: '2027-04-12', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
      { fase: 'final', desde: '2027-04-10', hasta: '2027-04-25', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
    ],
    habituales: [
      { fase: 'inicio', tipica: '03-20', rangoMin: '03-08', rangoMax: '04-01' },
      { fase: 'avance', tipica: '03-28', rangoMin: '03-16', rangoMax: '04-08' },
      { fase: 'pleno', tipica: '04-04', rangoMin: '03-24', rangoMax: '04-15' },
      { fase: 'final', tipica: '04-15', rangoMin: '04-05', rangoMax: '04-28' },
    ],
    entradasHasta: '2026-10-19',
    generadaEn: '2026-10-20T06:30:00+02:00',
    umbrales: { inicio: 0.15, avance: 0.4, pleno: 0.7, final: 0.5 },
    editorial: {
      historia:
        'Más de un millón de cerezos cubren de blanco las laderas del valle. La floración sube por altitud: empieza en el fondo del valle y termina en los pueblos más altos.',
      queVer: ['Fiesta del Cerezo en Flor', 'Reserva Natural Garganta de los Infiernos y sus pozas', 'Mirador del Puerto de Tornavacas'],
      comoLlegar: 'A unas 2 h 30 min desde Madrid por la A-5 y la N-110, o 1 h desde Plasencia.',
      acceso: 'Acceso libre. En la Garganta de los Infiernos sigue las sendas señalizadas.',
      consejos: ['Si llegas pronto, sube al valle alto: allí la flor aguanta más.', 'Los fines de semana de la fiesta hay mucho tráfico en la N-110.'],
    },
  },
  {
    id: 'alpujarra',
    nombre: 'Almendro de la Alpujarra',
    lugar: 'La Alpujarra',
    provincia: 'Granada / Almería',
    region: 'Andalucía',
    especie: 'Almendro (Prunus dulcis)',
    fenomeno: 'Floración',
    tipo: 'floracion',
    lat: 36.93,
    lon: -3.35,
    color: '#F2A7BC',
    ilustracion: 'almendro',
    temporada: 'Invierno 2027',
    finTemporada: '2027-03-10',
    datosReales: false,
    estado: {
      fase: 'fuera_temporada',
      tipoDato: 'observado',
      actualizadoEn: '2026-10-20T07:00:00+02:00',
      fuente: HISTORICO,
      resumen: 'Próximamente: aún sin datos reales. Sin flor. Los almendros suelen florecer entre finales de enero y febrero.',
    },
    ventanas: [
      { fase: 'inicio', desde: '2027-01-14', hasta: '2027-01-30', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
      { fase: 'avance', desde: '2027-01-24', hasta: '2027-02-08', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
      { fase: 'pleno', desde: '2027-02-03', hasta: '2027-02-20', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
      { fase: 'final', desde: '2027-02-20', hasta: '2027-03-05', tipoDato: 'previsto', confianza: 'baja', probabilidad: 0.7, metodo: 'modelo_v0', fuente: HISTORICO },
    ],
    habituales: [
      { fase: 'inicio', tipica: '01-22', rangoMin: '01-10', rangoMax: '02-05' },
      { fase: 'avance', tipica: '02-01', rangoMin: '01-20', rangoMax: '02-12' },
      { fase: 'pleno', tipica: '02-10', rangoMin: '01-30', rangoMax: '02-22' },
      { fase: 'final', tipica: '02-25', rangoMin: '02-15', rangoMax: '03-08' },
    ],
    entradasHasta: '2026-10-19',
    generadaEn: '2026-10-20T06:30:00+02:00',
    umbrales: { inicio: 0.15, avance: 0.4, pleno: 0.7, final: 0.5 },
    editorial: {
      historia:
        'En pleno invierno, los almendros de las laderas de Sierra Nevada se cubren de blanco y rosa entre bancales y pueblos blancos de tradición morisca.',
      queVer: ['Barranco del Poqueira: Pampaneira, Bubión y Capileira', 'Acequias y bancales históricos', 'Miradores sobre el valle del Guadalfeo'],
      comoLlegar: 'Desde Granada, 1 h por la A-44 y la A-348 hasta Órgiva.',
      acceso: 'Acceso libre. Carreteras de montaña estrechas: conduce con calma.',
      consejos: ['La flor llega antes a las cotas bajas y sube con las semanas.', 'Tras una helada fuerte la flor puede durar menos.'],
    },
  },
];

export const getDestino = (id: string) => DESTINOS.find((d) => d.id === id);
