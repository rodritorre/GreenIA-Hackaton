// Página de solicitud de reserva (reserva.html). Sin pago: se envía por EmailJS.
import { enviarFormulario } from "./email.js";

const T = {
  es: {},
  en: {
    noCharge: "No payment: request only", h1: "Request your getaway",
    lead: "Nothing is charged. We'll email you to confirm availability and the final price with the place to stay.",
    who: "Your details", name: "Full name", email: "Email", phone: "Phone (optional)", checkin: "Arrival date",
    notes: "Comments (optional)", terms: "I agree to my data being used to handle this request.", privacy: "Privacy policy",
    send: "Send request", stay: "Stay", guests: "Guests", total: "Estimate",
    estimate: "Indicative price from published rates. The place to stay confirms the final price.",
    emptyTitle: "Choose your getaway first", emptyText: "Open a pack on the website and press “Request booking”.", toPacks: "See the packs",
    okTitle: "Request sent", back: "Back to Cuándo Florece",
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
document.title = tx("Solicitar reserva", "Request booking") + " · Cuándo Florece";

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
  try {
    await enviarFormulario({
      tipo: "reserva",
      asunto: `Solicitud de reserva: ${p.titulo} · ${p.destino}`,
      email, nombre,
      campos: {
        Nombre: nombre, Email: email, Teléfono: f.telefono.value.trim(), Llegada: f.entrada.value,
        Destino: `${p.destino} (${p.provincia})`, Pack: `${p.mes} · ${p.titulo}`,
        Alojamiento: `${p.alojamiento} · ${p.habitacion} · ${p.lugar}`, Huéspedes: `${p.grupo} · ${p.noches}`,
        Desglose: p.lineas.map((l) => `${l.c}: ${eur(l.v)}`).join(" | "),
        "Estimación total": eur(p.total), "No incluye": p.noIncluye, Comentarios: f.comentarios.value.trim(),
      },
      confirmacion: {
        asunto: tx(`Hemos recibido tu solicitud: ${p.titulo}`, `We've received your request: ${p.titulo}`),
        mensaje: tx(
          `Gracias, ${nombre}. Hemos recibido tu solicitud para ${p.destino} (llegada ${f.entrada.value}). Te escribiremos para confirmar disponibilidad y precio final. No se ha cobrado nada.`,
          `Thanks, ${nombre}. We've received your request for ${p.destino} (arrival ${f.entrada.value}). We'll email you to confirm availability and the final price. Nothing has been charged.`,
        ),
      },
    });
    $("ok-text").textContent = tx(
      `${p.titulo} · ${p.destino}. Te escribiremos a ${email} para confirmar disponibilidad y precio. No se ha cobrado nada.`,
      `${p.titulo} · ${p.destino}. We'll email ${email} to confirm availability and price. Nothing has been charged.`,
    );
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
    btn.textContent = tx("Enviar solicitud", "Send request");
  }
});
