import { ApiError, type Api } from './types';

// Same domain by default (the site and the API share it, under /api). VITE_API_URL points elsewhere if needed.
const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const r = await fetch(BASE + path, { credentials: import.meta.env.VITE_API_URL ? 'include' : 'same-origin', ...init, headers });
  if (r.status === 204) return undefined as T;
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const detail = data?.detail;
    const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d: { msg: string }) => d.msg).join('. ') : r.statusText;
    throw new ApiError(r.status, msg);
  }
  return data as T;
}

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]));
  return s.toString() ? `?${s}` : '';
};
const post = (body?: unknown): RequestInit => ({ method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
const form = (fields: Record<string, string | Blob | undefined>): RequestInit => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) fd.append(k, v);
  return { method: 'POST', body: fd };
};

export const httpApi: Api = {
  modo: 'http',
  estadoDatos: () => call('/estado-datos'),
  destinos: () => call('/destinos'),
  ficha: (id, idioma = 'es') => call(`/destinos/${encodeURIComponent(id)}${q({ idioma })}`),
  serie: (id) => call(`/destinos/${encodeURIComponent(id)}/serie`),
  mapa: (fecha) => call(`/mapa${q({ fecha })}`),
  ofertas: (destinoId) => call(`/ofertas${q({ destinoId })}`),
  fotos: (destinoId) => call(`/fotos${q({ destinoId })}`),
  suscribir: (body) => call('/alertas', post(body)),
  subirFoto: ({ foto, destinoId, fase, consentimiento, lat, lon }) =>
    call('/observaciones', form({ foto, destinoId, fase, consentimiento: String(consentimiento), lat: lat?.toString(), lon: lon?.toString() })),

  aforo: () => call('/aforo'),
  alternativas: (id) => call(`/destinos/${encodeURIComponent(id)}/alternativas`),
  agenda: (id) => call(`/destinos/${encodeURIComponent(id)}/agenda`),
  altaNegocio: (body) => call('/negocios', post(body)),
  contactoDestino: (body) => call('/contacto', post(body)),
  negocios: (id) => call(`/destinos/${encodeURIComponent(id)}/negocios`),

  destino: {
    panel: (id) => call(`/destino/${encodeURIComponent(id)}/panel`),
    guardarVisibilidad: (id, body) => call(`/destino/${encodeURIComponent(id)}/visibilidad`, { method: 'PUT', body: JSON.stringify(body) }),
    guardarAgenda: (id, agenda) => call(`/destino/${encodeURIComponent(id)}/agenda`, { method: 'PUT', body: JSON.stringify(agenda) }),
    guardarHistoria: (id, historia) => call(`/destino/${encodeURIComponent(id)}/historia`, { method: 'PUT', body: JSON.stringify({ historia }) }),
    reiniciarDemo: async () => ({ ok: true, mensaje: 'Solo existe en la demo' }),
  },

  login: (email, password) => call('/auth/login', post({ email, password })),
  logout: () => call('/auth/logout', post()),
  yo: () => call('/auth/yo'),

  admin: {
    fuentes: () => call('/admin/fuentes'),
    log: () => call('/admin/ingesta/log'),
    ejecutarIngesta: () => call('/admin/ingesta/ejecutar', post()),
    ejecuciones: () => call('/admin/ingesta/ejecuciones'),
    importar: (destinoId, dataset, archivo) => call('/admin/importar', form({ destinoId, dataset, archivo })),
    previsiones: () => call('/admin/previsiones'),
    recalcular: () => call('/admin/previsiones/recalcular', post()),
    comparativa: () => call('/admin/previsiones/comparativa'),
    fotos: (estado) => call(`/admin/fotos${q({ estado })}`),
    moderar: (id, estado, motivo) => call(`/admin/fotos/${id}/moderar`, post({ estado, motivo })),
    suscripciones: () => call('/admin/alertas/suscripciones'),
    prueba: (destinoId, fase) => call('/admin/alertas/prueba', post({ destinoId, fase })),
    despachar: () => call('/admin/alertas/despachar', post()),
    correos: () => call('/admin/correos'),
    destinos: () => call('/admin/destinos'),
    crearDestino: (body) => call('/admin/destinos', post(body)),
    editarDestino: (id, body) => call(`/admin/destinos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    editorial: (id) => call(`/admin/destinos/${id}/editorial`),
    guardarEditorial: (id, body) => call(`/admin/destinos/${id}/editorial`, { method: 'PUT', body: JSON.stringify(body) }),
    guardarPatrocinio: (id, body) => call(`/admin/destinos/${id}/patrocinio`, { method: 'PUT', body: JSON.stringify(body) }),
    ofertas: (destinoId) => call(`/admin/ofertas${q({ destinoId })}`),
    crearOferta: (body) => call('/admin/ofertas', post(body)),
    editarOferta: (id, body) => call(`/admin/ofertas/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    usuarios: () => call('/admin/usuarios'),
    crearUsuario: (body) => call('/admin/usuarios', post(body)),
  },
};
