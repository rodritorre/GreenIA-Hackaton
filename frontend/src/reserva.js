// Página de solicitud de reserva (reserva.html). Sin pago: se envía por EmailJS.
// Sin claves de EmailJS la solicitud se simula, para que la demo nunca falle.
import { config, emailConfigurado } from "./config";
import { enviarFormulario } from "./api/email";
import { htmlReserva, referenciaReserva } from "./api/correoHtml";

const T = {
  es: {},
  en: {
    noCharge: "Demo booking: nothing charged", h1: "Book your getaway",
    lead: "This is a demo booking in the prototype: nothing is charged. You will get the confirmation and your plan by email.",
    who: "Your details", name: "Full name", email: "Email", phone: "Phone (optional)", checkin: "Arrival date",
    notes: "Comments (optional)", terms: "I agree to my data being used to handle this request.", privacy: "Privacy policy",
    send: "Confirm booking", stay: "Stay", guests: "Guests", total: "Estimate",
    estimate: "Indicative price from published rates. The place to stay confirms the final price.",
    emptyTitle: "Choose your getaway first", emptyText: "Open a pack on the website and press “Request booking”.", toPacks: "See the packs",
    back: "Back to Cuándo Florece",
  },
};
let p = null;
try { p = JSON.parse(decodeURIComponent(location.hash.slice(1))); } catch (e) {}
const lang = p && p.lang === "en" ? "en" : "es";
const tx = (es, en) => (lang === "en" ? en : es);
const eur = (n) => n.toLocaleString(lang === "en" ? "en-GB" : "es-ES", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }) + " €";
const $ = (id) => document.getElementById(id);

document.documentElement.lang = lang;
document.querySelectorAll("[data-t]").forEach((el) => { const v = T[lang][el.dataset.t]; if (v) el.textContent = v; });
document.title = tx("Reservar", "Book") + " · Cuándo Florece";

if (!p || !p.destino) {
  $("paso-form").classList.add("hidden");
  $("paso-vacio").classList.remove("hidden");
} else {
  document.documentElement.style.setProperty("--season", p.color);
  $("s-mes").textContent = p.mes;
  $("s-dest").textContent = `${p.destino} · ${p.provincia}`;
  $("sum-title").textContent = p.titulo;
  $("s-aloj").textContent = p.alojamiento;
  $("s-hab").textContent = `${p.habitacion} · ${p.lugar}`;
  $("s-grupo").textContent = `${p.grupo} · ${p.noches}`;
  p.lineas.forEach((l) => {
    const r = document.createElement("div"); r.className = "row";
    const c = document.createElement("span"); c.textContent = l.c;
    const v = document.createElement("b"); v.textContent = eur(l.v);
    r.append(c, v); $("s-lineas").append(r);
  });
  $("s-total").textContent = eur(p.total);
  $("s-excl").textContent = tx("No incluye: ", "Not included: ") + p.noIncluye;
  $("form").entrada.min = new Date().toISOString().slice(0, 10);
}

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.currentTarget, btn = $("send"), err = $("err");
  err.classList.add("hidden");
  btn.disabled = true;
  btn.textContent = tx("Enviando…", "Sending…");
  const nombre = f.nombre.value.trim(), email = f.email.value.trim();
  const referencia = referenciaReserva();
  const html = htmlReserva({
    idioma: lang, sitio: config.siteUrl || location.origin, referencia, nombre,
    destino: p.destino, provincia: p.provincia, titulo: p.titulo, entrada: f.entrada.value, noches: p.nNoches || 1,
    alojamiento: p.alojamiento, lugar: p.lugar, habitacion: p.habitacion, grupo: p.grupo,
    fase: p.fase, plato: p.plato, dias: p.dias, lineas: p.lineas, total: p.total, noIncluye: p.noIncluye,
  });
  try {
    if (emailConfigurado()) await enviarFormulario({
      tipo: "reserva",
      asunto: `Reserva ${referencia}: ${p.titulo} · ${p.destino}`,
      email, nombre, idioma: lang,
      campos: {
        Referencia: referencia, Nombre: nombre, Email: email, Teléfono: f.telefono.value.trim(), Llegada: f.entrada.value,
        Destino: `${p.destino} (${p.provincia})`, Pack: `${p.mes} · ${p.titulo}`,
        Alojamiento: `${p.alojamiento} · ${p.habitacion} · ${p.lugar}`, Huéspedes: `${p.grupo} · ${p.noches}`,
        Desglose: p.lineas.map((l) => `${l.c}: ${eur(l.v)}`).join(" | "),
        "Estimación total": eur(p.total), "No incluye": p.noIncluye, Comentarios: f.comentarios.value.trim(),
      },
      confirmacion: {
        asunto: tx(`🌸 Confirmada: tu escapada a ${p.destino} · Ref. ${referencia}`, `🌸 Confirmed: your getaway to ${p.destino} · Ref. ${referencia}`),
        mensaje: tx(`Reserva ${referencia} confirmada.`, `Booking ${referencia} confirmed.`),
        html,
      },
    });
    // The page shows the same confirmation as the email (all values are escaped in htmlReserva).
    $("ok-mail").innerHTML = html;
    $("ok-sent").textContent = tx(`Te hemos enviado esta confirmación a ${email}.`, `We have sent this confirmation to ${email}.`);
    $("paso-form").classList.add("hidden");
    $("paso-ok").classList.remove("hidden");
    window.scrollTo(0, 0);
  } catch (x) {
    console.error(x);
    err.textContent = x.message === "email-no-configurado"
      ? tx("El envío de solicitudes aún no está activado. Inténtalo más tarde.", "Requests are not enabled yet. Please try again later.")
      : tx("No hemos podido enviar la solicitud. Revisa tu conexión e inténtalo de nuevo.", "We couldn't send your request. Check your connection and try again.");
    err.classList.remove("hidden");
    btn.disabled = false;
    btn.textContent = tx("Confirmar reserva", "Confirm booking");
  }
});
