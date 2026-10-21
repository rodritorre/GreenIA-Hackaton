// MOCK of the destination-licence and business-listing features (panel, visibility, moderation).
// Demand figures and KPIs are SIMULATED. State lives in the browser (localStorage) so a reload
// keeps what the town decided during the demo; "reiniciar" wipes it.
import type {
  Alternativa, DemandaVentana, EstadoAforo, EventoAgenda, KpiImpacto, SolicitudNegocio, SolicitudNegocioIn, Veredicto, Visibilidad,
} from '../types';
import { DESTINOS } from './destinos';

const CLAVE = 'cuandoflorece.demo.v1';

interface Estado {
  visibilidad: Record<string, Visibilidad>;
  provincias: Record<string, Record<string, number>>;
  solicitudes: SolicitudNegocio[];
  agenda: Record<string, EventoAgenda[]>;
  historia: Record<string, string>;
}

const vacio = (): Estado => ({ visibilidad: {}, provincias: {}, solicitudes: [], agenda: {}, historia: {} });

function leer(): Estado {
  try {
    const raw = window.localStorage.getItem(CLAVE);
    return raw ? { ...vacio(), ...(JSON.parse(raw) as Partial<Estado>) } : vacio();
  } catch {
    return vacio();
  }
}

export const estado: Estado = leer();

export function guardar() {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // private mode or blocked storage: the demo still works, it just forgets on reload
  }
}

export function reiniciar() {
  Object.assign(estado, vacio());
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // nothing to clear
  }
}

// ---- Who the paying destinations are ------------------------------------------------------

export const ENTIDAD: Record<string, string> = {
  brihuega: 'Ayuntamiento de Brihuega',
  'tejera-negra': 'Parque Natural Sierra Norte de Guadalajara',
  jerte: 'Mancomunidad del Valle del Jerte',
  alpujarra: 'Mancomunidad de la Alpujarra',
};

const AFORO_INICIAL: Record<string, number> = {
  brihuega: 2500, // visitors per day the town says it can take in July
  'tejera-negra': 600, // 130 parking spaces at the forest entrance
  jerte: 8000,
  alpujarra: 3000,
};

export function visibilidad(id: string): Visibilidad {
  return estado.visibilidad[id] ?? { destinoId: id, modo: 'normal', aforoDiario: AFORO_INICIAL[id] ?? 1000, actualizadoEn: null };
}

// ---- Demand (SIMULATED baseline + what demo visitors type in the alert form) ---------------

const PROVINCIAS_BASE: Record<string, Record<string, number>> = {
  brihuega: { Madrid: 719, Guadalajara: 186, Toledo: 74, Barcelona: 62, Valencia: 50, Otras: 149 },
  'tejera-negra': { Madrid: 412, Guadalajara: 96, Segovia: 41, Soria: 18, Otras: 73 },
  jerte: { Madrid: 280, Cáceres: 120, Salamanca: 64, Badajoz: 40, Otras: 96 },
  alpujarra: { Granada: 150, Málaga: 88, Almería: 61, Sevilla: 40, Otras: 51 },
};

const VENTANAS: Record<string, DemandaVentana[]> = {
  brihuega: [
    { desde: '2027-06-26', hasta: '2027-06-27', finDeSemana: true, personas: 160, visitantesDia: 1400 },
    { desde: '2027-06-28', hasta: '2027-07-02', finDeSemana: false, personas: 110, visitantesDia: 600 },
    { desde: '2027-07-03', hasta: '2027-07-04', finDeSemana: true, personas: 520, visitantesDia: 3100 },
    { desde: '2027-07-05', hasta: '2027-07-09', finDeSemana: false, personas: 190, visitantesDia: 900 },
    { desde: '2027-07-10', hasta: '2027-07-11', finDeSemana: true, personas: 260, visitantesDia: 2200 },
  ],
  'tejera-negra': [
    { desde: '2026-10-24', hasta: '2026-10-25', finDeSemana: true, personas: 210, visitantesDia: 900 },
    { desde: '2026-10-26', hasta: '2026-10-30', finDeSemana: false, personas: 80, visitantesDia: 250 },
    { desde: '2026-10-31', hasta: '2026-11-01', finDeSemana: true, personas: 260, visitantesDia: 1100 },
    { desde: '2026-11-02', hasta: '2026-11-06', finDeSemana: false, personas: 90, visitantesDia: 300 },
  ],
};

export function demanda(id: string) {
  const base = { ...(PROVINCIAS_BASE[id] ?? {}) };
  for (const [p, n] of Object.entries(estado.provincias[id] ?? {})) base[p] = (base[p] ?? 0) + n;
  const porProvincia = Object.entries(base)
    .map(([provincia, personas]) => ({ provincia, personas }))
    .sort((a, b) => (a.provincia === 'Otras' ? 1 : b.provincia === 'Otras' ? -1 : b.personas - a.personas));
  const total = porProvincia.reduce((s, p) => s + p.personas, 0);
  return { total, porProvincia, porVentana: VENTANAS[id] ?? [] };
}

export function sumarAlerta(id: string, provincia: string | undefined) {
  if (!provincia) return;
  const p = (estado.provincias[id] ??= {});
  p[provincia] = (p[provincia] ?? 0) + 1;
  guardar();
}

// ---- "Pueblos por descubrir": nearby alternatives (editorial, static) -----------------------

export const ALTERNATIVAS: Record<string, Alternativa[]> = {
  brihuega: [
    { nombre: 'Masegoso de Tajuña', distanciaKm: 15, motivo: 'Campos de lavanda con la misma floración y muchos menos visitantes.' },
    { nombre: 'Valderrebollo', distanciaKm: 20, motivo: 'Lavanda junto a un pueblo de piedra de la Alcarria, sin colas.' },
    { nombre: 'Cifuentes', distanciaKm: 25, motivo: 'Nacimiento del río y castillo, a media hora de los campos.' },
  ],
  'tejera-negra': [
    { nombre: 'Valverde de los Arroyos', distanciaKm: 35, motivo: 'Arquitectura negra y la chorrera de Despeñalagua.' },
    { nombre: 'Majaelrayo', distanciaKm: 30, motivo: 'Pueblo de pizarra al pie del Ocejón, con rutas de otoño.' },
    { nombre: 'Hayedo de Montejo', distanciaKm: 60, motivo: 'Otro hayedo con el mismo otoño y visitas guiadas con reserva.' },
  ],
  jerte: [
    { nombre: 'La Vera (Garganta la Olla)', distanciaKm: 35, motivo: 'Cerezos y gargantas en la cara sur de Gredos.' },
    { nombre: 'Valle del Ambroz (Hervás)', distanciaKm: 40, motivo: 'Barrio judío y castañares, con menos tráfico que la N-110.' },
  ],
  montejo: [
    { nombre: 'La Hiruela', distanciaKm: 7, motivo: 'Pueblo de pizarra con castañar y molino harinero, muy tranquilo en otoño.' },
    { nombre: 'Puebla de la Sierra', distanciaKm: 15, motivo: 'Valle apartado de la Sierra del Rincón con rutas de otoño.' },
  ],
  tejeda: [
    { nombre: 'Artenara', distanciaKm: 12, motivo: 'Casas cueva y miradores sobre el Roque Bentayga.' },
    { nombre: 'Valsequillo', distanciaKm: 25, motivo: 'Almendros de cumbre con menos visitantes que Tejeda.' },
  ],
  teide: [
    { nombre: 'Vilaflor', distanciaKm: 20, motivo: 'El pueblo más alto de Canarias, entre pinares.' },
    { nombre: 'La Orotava', distanciaKm: 30, motivo: 'Casco histórico y balcones de madera a la bajada del parque.' },
  ],
  alpujarra: [
    { nombre: 'Valle de Lecrín', distanciaKm: 30, motivo: 'Almendros y naranjos, más cerca de Granada.' },
    { nombre: 'Sierra de la Contraviesa', distanciaKm: 25, motivo: 'Almendros entre viñedos, con carreteras tranquilas.' },
  ],
};

// ---- Capacity: what the public site shows -------------------------------------------------

export function estadoAforo(id: string): EstadoAforo {
  const v = visibilidad(id);
  const d = DESTINOS.find((x) => x.id === id);
  const ventanas = VENTANAS[id] ?? [];
  const base = { destinoId: id, modo: v.modo, alternativas: ALTERNATIVAS[id] ?? [] };
  // Weekdays with room, preferring the ones right after the busiest weekend (still in bloom).
  const conSitio = ventanas.filter((w) => !w.finDeSemana && w.visitantesDia <= v.aforoDiario);
  const pico = [...ventanas].sort((a, b) => b.visitantesDia - a.visitantesDia)[0];
  const tranquila = conSitio.find((w) => pico && w.desde > pico.hasta) ?? conSitio[0];
  const entreSemana = tranquila ? { desde: tranquila.desde, hasta: tranquila.hasta } : null;

  if (v.modo === 'pausada') {
    const pleno = d?.ventanas.find((w) => w.fase === 'pleno');
    return { ...base, completo: pleno ? { motivo: 'pausa', desde: pleno.desde, hasta: pleno.hasta } : null, entreSemana: null };
  }
  if (v.modo === 'reducida') {
    // The busiest window over the town's capacity stops being promoted.
    const llena = ventanas.filter((w) => w.visitantesDia > v.aforoDiario).sort((a, b) => b.visitantesDia - a.visitantesDia)[0];
    return { ...base, completo: llena ? { motivo: 'aforo', desde: llena.desde, hasta: llena.hasta } : null, entreSemana };
  }
  return { ...base, completo: null, entreSemana: null };
}

// ---- Impact indicators (SIMULATED) --------------------------------------------------------

export function kpis(id: string): KpiImpacto[] {
  const verificados = estado.solicitudes.filter((s) => s.destinoId === id && s.veredicto.estado === 'aprobado').length;
  if (id === 'tejera-negra') {
    return [
      { clave: 'gasto', valor: '12.900 €', tendencia: '+15 % frente a 2025' },
      { clave: 'entreSemana', valor: '36 %', tendencia: '+6 puntos' },
      { clave: 'diasLleno', valor: '2', tendencia: '-3 frente a 2025' },
      { clave: 'alternativas', valor: '480', tendencia: 'visitas a Valverde y Majaelrayo' },
      { clave: 'acierto', valor: 'En curso', tendencia: 'se mide al acabar el otoño' },
      { clave: 'negocios', valor: String(6 + verificados), tendencia: 'negocios locales verificados' },
    ];
  }
  return [
    { clave: 'gasto', valor: '38.400 €', tendencia: '+22 % frente a 2026' },
    { clave: 'entreSemana', valor: '41 %', tendencia: '+9 puntos' },
    { clave: 'diasLleno', valor: '3', tendencia: '-4 frente a 2026' },
    { clave: 'alternativas', valor: '1.150', tendencia: 'visitas a Masegoso y Valderrebollo' },
    { clave: 'acierto', valor: '2026: sí', tendencia: 'la flor llegó dentro del rango previsto' },
    { clave: 'negocios', valor: String(11 + verificados), tendencia: 'negocios locales verificados' },
  ];
}

// ---- Automatic moderation (SCRIPTED: no AI call in the demo; production calls an LLM API) ---

const PROMOCIONAL = /(el mejor|la mejor|incre[ií]ble|reserva ya|[uú]nico en|100 ?%|!!)/i;
export const MODELO_MODERACION = 'Moderación automática con IA (simulada en la demo)';

export function moderar(s: SolicitudNegocioIn): Veredicto {
  const comprobaciones: Veredicto['comprobaciones'] = [];
  const pueblos = [DESTINOS.find((d) => d.id === s.destinoId)?.lugar, ...(ALTERNATIVAS[s.destinoId] ?? []).map((a) => a.nombre)];
  const enZona = pueblos.some((p) => p && s.pueblo.toLowerCase().includes(p.toLowerCase().split(' (')[0]));
  comprobaciones.push({ clave: 'zona', ok: enZona, detalle: enZona ? `Dirección en ${s.pueblo}, dentro del destino` : `${s.pueblo || 'Sin pueblo'}: fuera de los pueblos del destino` });
  if (s.tipo === 'finca') {
    comprobaciones.push({ clave: 'normas', ok: !!s.normas, detalle: s.normas ? `Normas de la finca indicadas (${s.normas})` : 'Faltan las normas de acceso a la finca' });
  }
  const promo = !!s.resena && PROMOCIONAL.test(s.resena);
  if (s.resena) comprobaciones.push({ clave: 'texto', ok: !promo, detalle: promo ? 'Texto promocional, no una experiencia de visita' : 'Reseña con detalles concretos de la visita' });
  if (s.resena) comprobaciones.push({ clave: 'origen', ok: !s.mismaIp, detalle: s.mismaIp ? 'Enviada desde la misma IP que el negocio' : 'Origen distinto al del negocio' });
  if (s.fotoDistanciaKm !== undefined) {
    const lejos = s.fotoDistanciaKm > 3;
    comprobaciones.push({ clave: 'foto', ok: !lejos, detalle: `Foto a ${s.fotoDistanciaKm.toLocaleString('es')} km del pueblo${lejos ? ' (máximo 3 km)' : ''}` });
  }

  let estadoV: Veredicto['estado'] = 'aprobado';
  let motivo = 'Negocio verificado: datos coherentes, ubicación dentro del destino y sin señales de reseñas falsas. Recibe el sello de negocio verificado.';
  if (promo || s.mismaIp) {
    estadoV = 'rechazado';
    motivo = `Reseña falsa: ${[promo && 'texto promocional', s.mismaIp && 'misma IP que el negocio'].filter(Boolean).join(', ')}. No se publica.`;
  } else if (!enZona || (s.fotoDistanciaKm ?? 0) > 3 || (s.tipo === 'finca' && !s.normas)) {
    estadoV = 'revision';
    motivo = (s.fotoDistanciaKm ?? 0) > 3
      ? 'La foto está fuera del radio de 3 km del pueblo: pasa a revisión humana del ayuntamiento.'
      : 'Faltan datos para verificarlo solo: pasa a revisión humana del ayuntamiento.';
  }
  return { estado: estadoV, motivo, comprobaciones, modelo: MODELO_MODERACION };
}

/** Two requests already in the town's queue when the demo starts. */
export const SOLICITUDES_INICIALES: SolicitudNegocio[] = [
  {
    id: 1, destinoId: 'brihuega', nombre: 'Destilería La Alcarria', tipo: 'productor', pueblo: 'Brihuega',
    descripcion: 'Visitas a la destilería de esencia de lavanda en temporada.', recibidaEn: '2026-10-18T10:20:00+02:00',
    veredicto: {
      estado: 'aprobado', motivo: 'Negocio verificado: datos coherentes y ubicación dentro del destino.', modelo: MODELO_MODERACION,
      comprobaciones: [{ clave: 'zona', ok: true, detalle: 'Dirección en Brihuega, dentro del destino' }],
    },
  },
  {
    id: 2, destinoId: 'brihuega', nombre: 'Finca Los Llanos', tipo: 'finca', pueblo: 'Brihuega', normas: 'entrada',
    descripcion: 'Campo de lavandín con entrada de pago y zona de fotos.', fotoDistanciaKm: 4.2, recibidaEn: '2026-10-19T17:05:00+02:00',
    veredicto: {
      estado: 'revision', motivo: 'La foto está fuera del radio de 3 km del pueblo: pasa a revisión humana del ayuntamiento.', modelo: MODELO_MODERACION,
      comprobaciones: [{ clave: 'foto', ok: false, detalle: 'Foto a 4,2 km del pueblo (máximo 3 km)' }],
    },
  },
];

export const AGENDA_INICIAL: Record<string, EventoAgenda[]> = {
  brihuega: [
    { fecha: '2027-07-03', titulo: 'Festival de la Lavanda: concierto al atardecer entre los campos' },
    { fecha: '2027-07-10', titulo: 'Mercado de productores de la Alcarria' },
    { fecha: '2027-07-17', titulo: 'Visita guiada a los jardines de la Real Fábrica de Paños' },
  ],
  'tejera-negra': [{ fecha: '2026-10-31', titulo: 'Ruta guiada por el hayedo (plazas limitadas, con reserva)' }],
};

export const agenda = (id: string) => estado.agenda[id] ?? AGENDA_INICIAL[id] ?? [];
