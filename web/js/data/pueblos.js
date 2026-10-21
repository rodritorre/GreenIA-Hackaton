// Lo que publica cada pueblo desde su panel (#destino): modo de promoción, aforo,
// fechas completas, pueblos alternativos, historia y agenda. También las solicitudes
// de alta de negocio enviadas desde este navegador.
//
// No hay datos de partida: todo empieza vacío y solo contiene lo que escribe el pueblo.
// Sin servidor, se guarda en localStorage (solo en este navegador).
import { Ot, oo } from "./destinos.js";
import { config } from "../config.js";

const CLAVE = "cf-pueblos-v1";
const vacio = () => ({ visibilidad: {}, solicitudes: [], agenda: {}, historia: {}, alternativas: {} });
let estado = leer();
const oyentes = new Set();

function leer() {
  try {
    return { ...vacio(), ...JSON.parse(localStorage.getItem(CLAVE) || "{}") };
  } catch {
    return vacio();
  }
}
function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {}
  oyentes.forEach((f) => f());
}
const suscribir = (f) => (oyentes.add(f), () => oyentes.delete(f));
const ahora = () => new Date().toISOString();

// Cualquier destino del mapa puede tener panel.
const conPanel = Ot.map((d) => d.id);
const plenoDe = (id) => {
  const d = oo(id);
  return d == null ? void 0 : d.ventanas.find((w) => w.fase === "pleno");
};

const visibilidad = (id) =>
  estado.visibilidad[id] ?? { modo: "normal", aforoDiario: null, desde: "", hasta: "", actualizadoEn: null };
const alternativasDe = (id) => estado.alternativas[id] ?? [];
const agendaDe = (id) => estado.agenda[id] ?? [];
const historiaDe = (id) => estado.historia[id];

// Lo que ve el viajero según lo que ha decidido el pueblo.
function aforo(id) {
  const v = visibilidad(id),
    base = { modo: v.modo, alternativas: alternativasDe(id), completo: null };
  if (v.modo === "normal") return base;
  const p = plenoDe(id),
    desde = v.desde || (v.modo === "pausada" && p ? p.desde : ""),
    hasta = v.hasta || (v.modo === "pausada" && p ? p.hasta : "");
  return desde && hasta
    ? { ...base, completo: { motivo: v.modo === "pausada" ? "pausa" : "aforo", desde, hasta } }
    : base;
}

const solicitudes = () => estado.solicitudes;

function panel(id) {
  const d = oo(id);
  return {
    destinoId: id,
    nombre: d.nombre,
    pleno: plenoDe(id),
    visibilidad: visibilidad(id),
    aforo: aforo(id),
    alternativas: alternativasDe(id),
    solicitudes: solicitudes().filter((s) => s.destinoId === id).reverse(),
    agenda: agendaDe(id),
    historia: estado.historia[id] ?? d.editorial.historia ?? "",
  };
}

function guardarVisibilidad(id, v) {
  estado.visibilidad[id] = {
    modo: v.modo,
    aforoDiario: v.aforoDiario ? Math.max(0, Math.round(v.aforoDiario)) : null,
    desde: v.desde || "",
    hasta: v.hasta || "",
    actualizadoEn: ahora(),
  };
  guardar();
}
function guardarAgenda(id, lista) {
  estado.agenda[id] = lista;
  guardar();
}
function guardarHistoria(id, texto) {
  estado.historia[id] = texto;
  guardar();
}
function guardarAlternativas(id, lista) {
  estado.alternativas[id] = lista;
  guardar();
}
function reiniciar() {
  estado = vacio();
  guardar();
}

// ---------- Alta de negocio: comprobaciones automáticas previas ----------
// No sustituyen la revisión humana: solo señalan lo que hay que mirar.
const tiposNegocio = ["alojamiento", "actividad", "finca", "productor"],
  normasFinca = ["abierta", "entrada", "prohibida"],
  promo = /(el mejor|la mejor|incre[ií]ble|reserva ya|[uú]nico en|100 ?%|!!)/i;

function comprobar(f) {
  const d = oo(f.destinoId),
    c = [],
    nombres = [d == null ? void 0 : d.lugar, ...alternativasDe(f.destinoId).map((x) => x.nombre)],
    enZona = nombres.some(
      (p) =>
        p &&
        p
          .toLowerCase()
          .split(/[,·(]/)[0]
          .trim()
          .split(" ")
          .some((w) => w.length > 3 && f.pueblo.toLowerCase().includes(w)),
    );
  c.push({
    clave: "zona",
    ok: enZona,
    detalle: enZona ? `${f.pueblo}: dentro del destino` : `${f.pueblo || "Sin pueblo"}: no coincide con el destino`,
  });
  f.tipo === "finca" &&
    c.push({
      clave: "normas",
      ok: !!f.normas,
      detalle: f.normas ? "Normas de acceso indicadas" : "Faltan las normas de acceso a la finca",
    });
  const publi = !!f.resena && promo.test(f.resena);
  f.resena &&
    c.push({
      clave: "texto",
      ok: !publi,
      detalle: publi ? "La reseña parece texto promocional" : "Reseña sin señales de texto promocional",
    });
  if (f.fotoDistanciaKm !== void 0) {
    const lejos = f.fotoDistanciaKm > 3;
    c.push({ clave: "foto", ok: !lejos, detalle: `Foto a ${f.fotoDistanciaKm.toLocaleString("es")} km del pueblo${lejos ? " (máximo 3 km)" : ""}` });
  }
  // Todo pasa por revisión humana; si alguna comprobación falla, se marca para mirarla primero.
  return { estado: c.every((x) => x.ok) ? "recibida" : "revision", comprobaciones: c };
}

function registrarSolicitud(f) {
  const s = { ...f, id: estado.solicitudes.length + 1, recibidaEn: ahora(), veredicto: comprobar(f) };
  estado.solicitudes.push(s);
  guardar();
  return s;
}

const vacioNegocio = { destinoId: Ot[0].id, nombre: "", tipo: "alojamiento", pueblo: "", descripcion: "", email: "", telefono: "" },
  // Casos de prueba: solo con config.demo (no se muestran en producción).
  casosPrueba = config.demo
    ? [
        { key: "alta.preset1", datos: { ...vacioNegocio, destinoId: "brihuega", nombre: "Prueba: casa rural", pueblo: "Brihuega", fotoDistanciaKm: 0.6 } },
        {
          key: "alta.preset2",
          datos: { ...vacioNegocio, destinoId: "brihuega", nombre: "Prueba: reseña promocional", pueblo: "Brihuega", resena: "¡¡La mejor de España!! Reserva ya.", fotoDistanciaKm: 1.2 },
        },
        { key: "alta.preset3", datos: { ...vacioNegocio, destinoId: "brihuega", nombre: "Prueba: foto lejos", tipo: "finca", normas: "abierta", pueblo: "Brihuega", fotoDistanciaKm: 4.8 } },
      ]
    : [];

const destinosPanel = Ot;
const provincias = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Bizkaia",
  "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ceuta", "Ciudad Real", "Córdoba", "Cuenca", "Gipuzkoa",
  "Girona", "Granada", "Guadalajara", "Huelva", "Huesca", "Illes Balears", "Jaén", "La Rioja", "Las Palmas", "León",
  "Lleida", "Lugo", "Madrid", "Málaga", "Melilla", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra",
  "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia",
  "Valladolid", "Zamora", "Zaragoza", "Fuera de España",
];

export {
  aforo,
  agendaDe,
  alternativasDe,
  casosPrueba,
  conPanel,
  destinosPanel,
  guardarAgenda,
  guardarAlternativas,
  guardarHistoria,
  guardarVisibilidad,
  historiaDe,
  normasFinca,
  panel,
  provincias,
  registrarSolicitud,
  reiniciar,
  suscribir,
  tiposNegocio,
  vacioNegocio,
};
