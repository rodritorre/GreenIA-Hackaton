// In-browser implementation of the API, used where no backend is reachable (the shared demo link).
// It answers with the same shapes as the real API, from the sample data in this folder.
import { addDays } from '../../lib/fechas';
import { ApiError, type Api, type DestinoConfig, type DestinoResumen, type EmailOut, type Oferta, type SolicitudNegocio, type Usuario } from '../types';
import { FOTOS, FUENTES, LOG_INGESTA, OFERTAS, SUSCRIPCIONES } from './comercial';
import { HOY, ULTIMA_ACTUALIZACION } from './config';
import { DESTINOS, fuentesDe } from './destinos';
import { estadoEn } from './fenologia';
import type { Destino } from './tipos';
import {
  ENTIDAD, SOLICITUDES_INICIALES, agenda, demanda, estado as demo, estadoAforo, guardar, kpis, moderar, reiniciar, sumarAlerta, visibilidad,
  ALTERNATIVAS,
} from './pueblo';

const wait = <T>(v: T, ms = 120): Promise<T> => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms));

const DEMO_USER: Usuario = { id: 1, email: 'demo@cuandoflorece.es', nombre: 'Equipo Greenia', rol: 'admin', activo: true, ultimoAcceso: null };

const ofertas: Oferta[] = OFERTAS.map((o) => ({ ...o, url: null }));
const fotos = FOTOS.map((f, i) => ({
  id: i + 1,
  destinoId: f.destinoId,
  lat: f.lat,
  lon: f.lon,
  capturadaEn: f.capturadaEn,
  faseReportada: f.faseReportada,
  estado: f.estado,
  zona: f.zona,
  url: null,
  distanciaKm: f.distanciaKm,
  horas: f.horas,
  motivo: f.motivo ?? null,
  revisadaPor: null,
  recibidaEn: f.capturadaEn,
}));
const correos: EmailOut[] = [];
let sesion = false;

// Stories the town edited in its panel survive a reload (demo state in localStorage).
for (const [id, historia] of Object.entries(demo.historia)) {
  const d = DESTINOS.find((x) => x.id === id);
  if (d) d.editorial.historia = historia;
}
const solicitudes = (): SolicitudNegocio[] => [...SOLICITUDES_INICIALES, ...demo.solicitudes];

function resumen(d: Destino): DestinoResumen {
  return {
    id: d.id, nombre: d.nombre, lugar: d.lugar, provincia: d.provincia, region: d.region, especie: d.especie,
    fenomeno: d.fenomeno, tipo: d.tipo, lat: d.lat, lon: d.lon, color: d.color, ilustracion: d.ilustracion,
    temporada: d.temporada, finTemporada: d.finTemporada, datosReales: d.datosReales, estado: d.estado,
    ventanas: d.ventanas, habituales: d.habituales, entradasHasta: d.entradasHasta, generadaEn: d.generadaEn,
  };
}

function destino(id: string): Destino {
  const d = DESTINOS.find((x) => x.id === id);
  if (!d) throw new ApiError(404, 'Destino no encontrado');
  return d;
}

function requiereSesion() {
  if (!sesion) throw new ApiError(401, 'Inicia sesión');
}

function config(d: Destino): DestinoConfig {
  return {
    id: d.id, nombre: d.nombre, lugar: d.lugar, provincia: d.provincia, region: d.region, especie: d.especie, fenomeno: d.fenomeno,
    tipo: d.tipo, lat: d.lat, lon: d.lon, color: d.color, ilustracion: d.ilustracion, temporada: d.temporada,
    finTemporada: d.finTemporada, datosReales: d.datosReales, activo: true, umbrales: d.umbrales,
    aemetEstacion: null, aemetMunicipio: null, usaSatelite: false,
    zonas: (d.zonas ?? []).map((z) => ({ id: z.id, nombre: z.nombre, lat: z.lat, lon: z.lon, radioM: 250 })),
    habituales: d.habituales,
  };
}

const ahora = () => new Date().toISOString();

export const mockApi: Api = {
  modo: 'mock',
  estadoDatos: () =>
    wait({ hoy: HOY, ultimaActualizacion: ULTIMA_ACTUALIZACION, fuentes: FUENTES.map(({ detalle: _d, ...f }) => f) }),
  destinos: () => wait(DESTINOS.map(resumen)),
  ficha: async (id) => {
    const d = destino(id);
    return wait({
      destino: resumen(d),
      calculado: { umbrales: d.umbrales, zonas: (d.zonas ?? []).map((z) => ({ ...z, fecha: d.entradasHasta })), historicoMargen: d.historicoMargen ?? [] },
      editorial: d.editorial,
      comercial: { ofertas: ofertas.filter((o) => o.destinoId === id), patrocinio: d.patrocinio ? { ...d.patrocinio, url: null } : null },
      fuentes: fuentesDe(id),
    });
  },
  serie: async (id) => {
    const d = destino(id);
    return wait({ puntos: d.serie ?? [], prevision: d.serieprevision ?? [] });
  },
  mapa: (fecha = HOY) =>
    wait({
      fecha, hoy: HOY, esPrevision: fecha > HOY,
      destinos: DESTINOS.map((d) => ({ destinoId: d.id, estado: estadoEn(d, fecha) })),
    }),
  ofertas: (destinoId) => wait(ofertas.filter((o) => !destinoId || o.destinoId === destinoId)),
  fotos: (destinoId) => wait(fotos.filter((f) => f.estado === 'valida' && (!destinoId || f.destinoId === destinoId))),
  suscribir: async (body) => {
    if (!body.consentimiento) throw new ApiError(422, 'Hace falta el consentimiento');
    sumarAlerta(body.destinoId, body.provincia);
    return wait({ ok: true, mensaje: 'Revisa tu correo para confirmar el aviso.' }, 400);
  },
  subirFoto: async ({ destinoId, fase }) =>
    wait(
      {
        id: fotos.length + 1,
        estado: 'pendiente',
        motivo: 'demo',
        comprobaciones: [
          { clave: 'ubicacion', ok: true, detalle: `a 0,8 km de ${destino(destinoId).zonas?.[1]?.nombre ?? destino(destinoId).nombre}` },
          { clave: 'fecha', ok: true, detalle: 'hecha hace 2 h' },
          { clave: 'duplicada', ok: true, detalle: `Foto nueva · ${fase}` },
        ],
      },
      600,
    ),
  aforo: () => wait(DESTINOS.map((d) => estadoAforo(d.id))),
  alternativas: (id) => wait(ALTERNATIVAS[id] ?? []),
  agenda: (id) => wait(agenda(id)),
  altaNegocio: async (body) => {
    destino(body.destinoId);
    if (!body.nombre.trim()) throw new ApiError(422, 'Falta el nombre del negocio');
    const s: SolicitudNegocio = { ...body, id: solicitudes().length + 1, recibidaEn: ahora(), veredicto: moderar(body) };
    demo.solicitudes.push(s);
    guardar();
    return wait(s, 1800); // the "analysing" moment
  },

  destino: {
    panel: async (id) => {
      const d = destino(id);
      return wait({
        destinoId: id,
        entidad: ENTIDAD[id] ?? d.nombre,
        plan: 'Licencia de destino',
        demanda: demanda(id),
        kpis: kpis(id),
        visibilidad: visibilidad(id),
        aforo: estadoAforo(id),
        solicitudes: solicitudes().filter((s) => s.destinoId === id).reverse(),
        fotosPendientes: fotos.filter((f) => f.destinoId === id && f.estado === 'pendiente').length,
        agenda: agenda(id),
        widget: `<iframe src="https://cuandoflorece.cabecerastudio.com/#widget=${id}" title="Cuándo Florece: ${d.nombre}" width="360" height="420" loading="lazy"></iframe>`,
      });
    },
    guardarVisibilidad: async (id, body) => {
      destino(id);
      const v = { destinoId: id, modo: body.modo, aforoDiario: Math.max(0, Math.round(body.aforoDiario)), actualizadoEn: ahora() };
      demo.visibilidad[id] = v;
      guardar();
      return wait(v, 300);
    },
    guardarAgenda: async (id, lista) => {
      demo.agenda[id] = lista;
      guardar();
      return wait(lista);
    },
    guardarHistoria: async (id, historia) => {
      destino(id).editorial.historia = historia;
      demo.historia[id] = historia;
      guardar();
      return wait({ ok: true, mensaje: 'Historia publicada en la ficha del destino' });
    },
    reiniciarDemo: async () => {
      reiniciar();
      return wait({ ok: true, mensaje: 'Demo reiniciada' });
    },
  },

  login: async (email, password) => {
    if (!email || password.length < 4) throw new ApiError(401, 'Email o contraseña incorrectos');
    sesion = true;
    return wait({ ...DEMO_USER, email });
  },
  logout: async () => {
    sesion = false;
  },
  yo: async () => {
    requiereSesion();
    return wait(DEMO_USER);
  },

  admin: {
    fuentes: async () => (requiereSesion(), wait(FUENTES)),
    log: async () => (requiereSesion(), wait(LOG_INGESTA.map((l) => ({ ...l, hora: `${HOY}T${l.hora}:00+02:00` })))),
    ejecuciones: async () => wait([]),
    ejecutarIngesta: async () => {
      requiereSesion();
      LOG_INGESTA.push({ hora: new Date().toTimeString().slice(0, 5), nivel: 'info', mensaje: 'Ingesta manual completada: mismo código que el job diario' });
      return wait({ id: 99, origen: 'manual', iniciadaEn: ahora(), terminadaEn: ahora(), estado: 'ok' }, 1200);
    },
    importar: async (_d, dataset) => (requiereSesion(), wait({ dataset, filas: 0, archivoId: 0, avisos: ['Modo demostración: no se ha guardado nada'] })),
    previsiones: async () => {
      requiereSesion();
      return wait(DESTINOS.flatMap((d) => d.ventanas.filter((v) => v.fase === 'pleno' || v.fase === d.estado.fase)
        .map((v) => ({ destinoId: d.id, destino: d.nombre, tipo: d.tipo, ventana: v, entradasHasta: d.entradasHasta, generadaEn: d.generadaEn }))));
    },
    recalcular: async () => wait({ ok: true, mensaje: `Previsiones recalculadas: ${DESTINOS.length} destinos` }, 600),
    comparativa: async () =>
      wait(DESTINOS.filter((d) => d.comparativa).map((d) => {
        const c = d.comparativa!;
        return {
          destinoId: d.id, fase: c.fase, proporcionadaDesde: c.proporcionada.desde, proporcionadaHasta: c.proporcionada.hasta,
          propiaDesde: c.propia.desde, propiaHasta: c.propia.hasta, propiaProbabilidad: c.propia.probabilidad, maeDias: c.maeDias,
          cobertura: c.cobertura, explicacion: c.explicacion, calculadaEn: d.generadaEn,
        };
      })),
    fotos: async () => (requiereSesion(), wait(fotos)),
    moderar: async (id, estado, motivo) => {
      const f = fotos.find((x) => x.id === id);
      if (!f) throw new ApiError(404, 'Foto no encontrada');
      Object.assign(f, { estado, motivo: estado === 'rechazada' ? motivo ?? null : null, revisadaPor: DEMO_USER.email });
      return wait(f);
    },
    suscripciones: async () =>
      wait(SUSCRIPCIONES.map((s) => {
        const v = destino(s.destinoId).ventanas.find((w) => w.fase === s.fase)!;
        return { destinoId: s.destinoId, fase: s.fase, confirmadas: s.confirmadas, sinConfirmar: s.sinConfirmar, proximoEnvio: addDays(v.desde, -7) };
      })),
    prueba: async (destinoId, fase) => {
      const d = destino(destinoId);
      const v = d.ventanas.find((w) => w.fase === fase)!;
      const msg: EmailOut = {
        id: correos.length + 1, para: DEMO_USER.email, tipo: 'prueba', backend: 'console', estado: 'simulado', creadoEn: ahora(),
        asunto: `[PRUEBA] ${fase} en ${d.nombre}: entre el ${v.desde} y el ${v.hasta}`,
        cuerpo: `La previsión ya está a menos de 7 días.\nConfianza ${v.confianza}, ${Math.round(v.probabilidad * 100)} % de probabilidad.`,
      };
      correos.unshift(msg);
      return wait(msg);
    },
    despachar: async () => wait({ ok: true, mensaje: '0 avisos enviados (demostración)' }),
    correos: async () => wait(correos),
    destinos: async () => (requiereSesion(), wait(DESTINOS.map(config))),
    crearDestino: async (body) => wait({ ok: true, mensaje: `Destino ${body.nombre} creado (demostración, no se guarda)` }),
    editarDestino: async () => wait({ ok: true, mensaje: 'Guardado' }),
    editorial: async (id) => wait(destino(id).editorial),
    guardarEditorial: async (id, body) => {
      Object.assign(destino(id).editorial, body);
      return wait(body);
    },
    guardarPatrocinio: async (id, body) => {
      destino(id).patrocinio = body ? { entidad: body.entidad, mensaje: body.mensaje } : undefined;
      return wait(body);
    },
    ofertas: async (destinoId) => wait(ofertas.filter((o) => !destinoId || o.destinoId === destinoId)),
    crearOferta: async (body) => {
      const o: Oferta = {
        ...body, id: `o${ofertas.length + 1}`, url: body.url ?? null, descripcion: body.descripcion ?? '',
        distanciaKm: body.distanciaKm ?? 0, precio: body.precio ?? '', patrocinado: body.patrocinado ?? false,
      };
      ofertas.push(o);
      return wait(o);
    },
    editarOferta: async (id, body) => {
      const o = ofertas.find((x) => x.id === id);
      if (!o) throw new ApiError(404, 'Oferta no encontrada');
      Object.assign(o, body);
      return wait(o);
    },
    usuarios: async () => wait([DEMO_USER]),
    crearUsuario: async (body) => wait({ id: 2, email: body.email, nombre: body.nombre, rol: body.rol ?? 'editor', activo: true, ultimoAcceso: null }),
  },
};
