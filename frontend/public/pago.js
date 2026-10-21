// Moved out of pago.html so the page works under the site's Content-Security-Policy (no inline scripts).
  // Textos ES / EN
  const T = {
    es: {},
    en: {
      secure: "Secure payment", mock: "Mock-up · payment is not active and nothing is charged",
      s1: "Your getaway", s2: "Payment", s3: "Confirmation",
      h1: "Complete your booking", lead: "Check your details and choose how to pay. You'll get the confirmation by email.",
      who: "Your details", name: "First name", surname: "Last name", email: "Email", phone: "Phone",
      how: "Payment method", card: "Card", bizumSub: "With your phone", paypalSub: "With your account",
      cardNumber: "Card number", expiry: "Expiry",
      bizumInfo: "You'll get a notification in your bank's app to confirm the payment with your mobile number.",
      paypalInfo: "We'll take you to PayPal to sign in and confirm the payment.",
      terms: "I accept the booking conditions and the privacy policy.",
      note: "In the real version, payment would happen on the bank's secure gateway and this site would never see your card details.",
      stay: "Stay", guests: "Guests", total: "Total",
      okTitle: "Booking confirmed!", ref: "Reference", seeEmail: "See the confirmation email", close: "Close this window",
      okMock: "Simulation: nothing has been charged and the place to stay has not been contacted.",
    },
  };
  const ejemplo = {
    lang: "es", color: "#EC6A92", destino: "Cerezo del Valle del Jerte", provincia: "Cáceres",
    mes: "Marzo", titulo: "El valle empieza a blanquear", alojamiento: "Hotel Judería Valle del Jerte",
    lugar: "Cabezuela del Valle", habitacion: "Habitación doble con desayuno",
    grupo: "2 adultos · 0 niños · 1 habitación", noches: "2 noches",
    lineas: [{ c: "Hotel Judería Valle del Jerte · 1 habitación · 2 noches", v: 110 }, { c: "Comida en La Cabaña del Jerte (20 € × 2)", v: 40 }],
    total: 150, noIncluye: "Bebidas y extras",
  };
  let p;
  try { p = JSON.parse(decodeURIComponent(location.hash.slice(1))); } catch (e) { p = ejemplo; }
  const lang = p.lang === "en" ? "en" : "es";
  const eur = (n) => n.toLocaleString(lang === "en" ? "en-GB" : "es-ES", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }) + " €";
  const $ = (id) => document.getElementById(id);

  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((el) => { const v = T[lang][el.dataset.t]; if (v) el.textContent = v; });
  document.documentElement.style.setProperty("--season", p.color);

  $("s-mes").textContent = p.mes;
  $("s-dest").textContent = `${p.destino} · ${p.provincia}`;
  $("sum-title").textContent = p.titulo;
  $("s-aloj").textContent = p.alojamiento;
  $("s-hab").textContent = `${p.habitacion} · ${p.lugar}`;
  $("s-grupo").textContent = `${p.grupo} · ${p.noches}`;
  $("s-lineas").innerHTML = "";
  p.lineas.forEach((l) => {
    const r = document.createElement("div"); r.className = "row";
    const c = document.createElement("span"); c.textContent = l.c;
    const v = document.createElement("b"); v.textContent = eur(l.v);
    r.append(c, v); $("s-lineas").append(r);
  });
  $("s-total").textContent = eur(p.total);
  $("s-excl").textContent = (lang === "en" ? "Not included: " : "No incluye: ") + p.noIncluye;
  $("pay").textContent = (lang === "en" ? "Pay " : "Pagar ") + eur(p.total);
  document.title = (lang === "en" ? "Secure payment" : "Pago seguro") + " · Cuándo Florece";

  // Método de pago (solo visual)
  document.querySelectorAll(".method").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".method").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    ["tarjeta", "bizum", "paypal"].forEach((m) => $("m-" + m).classList.toggle("hidden", m !== b.dataset.m));
  }));

  // «Pagar»: simula el proceso y enseña la confirmación. No envía nada.
  $("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $("pay");
    btn.disabled = true;
    btn.textContent = lang === "en" ? "Processing…" : "Procesando…";
    setTimeout(() => {
      const ref = "CF-DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      $("ok-ref").textContent = ref;
      $("ok-text").textContent = lang === "en"
        ? `${p.titulo} · ${p.destino}. We've sent the details to your email.`
        : `${p.titulo} · ${p.destino}. Te hemos enviado los detalles a tu correo.`;
      $("paso-pago").classList.add("hidden");
      $("paso-ok").classList.remove("hidden");
      window.scrollTo(0, 0);
    }, 1200);
  });

document.querySelectorAll("[data-cerrar]").forEach((el) => el.addEventListener("click", () => window.close()));
