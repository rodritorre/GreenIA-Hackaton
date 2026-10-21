// Fondo animado: pétalos de flor cayendo poco a poco.
// Ajustes rápidos:
const AJUSTES = {
  densidad: 0.000022,        // pétalos por píxel de pantalla (más = más pétalos)
  maxPetalos: 35,
  velocidad: [0.25, 0.7],    // px por fotograma (mín, máx)
  tamano: [25, 26],          // px (mín, máx)
  opacidad: [0.35, 0.75],
  colores: ["#f5c1d1", "#ff6c96", "#f9d5df", "#e98fae", "#fbe1e8"],
};

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

const canvas = document.createElement("canvas");
canvas.id = "petalos";
canvas.setAttribute("aria-hidden", "true");
document.body.prepend(canvas);
const ctx = canvas.getContext("2d");

let ancho = 0, alto = 0, dpr = 1, petalos = [], animId = null;
const rand = (a, b) => a + Math.random() * (b - a);

function nuevoPetalo(arriba) {
  return {
    x: rand(0, ancho),
    y: arriba ? rand(-alto * 0.2, -20) : rand(-20, alto),
    t: rand(...AJUSTES.tamano),
    vy: rand(...AJUSTES.velocidad),
    vx: rand(-0.2, 0.2),
    giro: rand(0, Math.PI * 2),
    vGiro: rand(-0.015, 0.015),
    fase: rand(0, Math.PI * 2),
    vFase: rand(0.008, 0.02),
    vaiven: rand(0.3, 0.9),
    volteo: rand(0, Math.PI * 2),
    vVolteo: rand(0.01, 0.03),
    color: AJUSTES.colores[Math.floor(Math.random() * AJUSTES.colores.length)],
    alfa: rand(...AJUSTES.opacidad),
  };
}

function redimensionar() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  ancho = window.innerWidth;
  alto = window.innerHeight;
  canvas.width = ancho * dpr;
  canvas.height = alto * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.min(AJUSTES.maxPetalos, Math.round(ancho * alto * AJUSTES.densidad));
  while (petalos.length < n) petalos.push(nuevoPetalo(false));
  petalos.length = n;
}

function dibujarPetalo(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.giro);
  ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(p.volteo))); // efecto de girar en el aire
  ctx.globalAlpha = p.alfa;
  ctx.fillStyle = p.color;
  const t = p.t;
  ctx.beginPath();
  ctx.moveTo(0, -t / 2);
  ctx.bezierCurveTo(t * 0.55, -t * 0.45, t * 0.5, t * 0.3, 0, t / 2);
  ctx.bezierCurveTo(-t * 0.5, t * 0.3, -t * 0.55, -t * 0.45, 0, -t / 2);
  ctx.fill();
  // pequeña muesca del pétalo de cerezo
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(0, -t / 2, t * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function fotograma() {
  ctx.clearRect(0, 0, ancho, alto);
  for (let i = 0; i < petalos.length; i++) {
    const p = petalos[i];
    p.fase += p.vFase;
    p.volteo += p.vVolteo;
    p.giro += p.vGiro;
    p.y += p.vy;
    p.x += p.vx + Math.sin(p.fase) * p.vaiven;
    if (p.y > alto + 20 || p.x < -40 || p.x > ancho + 40) petalos[i] = nuevoPetalo(true);
    dibujarPetalo(petalos[i]);
  }
  animId = requestAnimationFrame(fotograma);
}

function arrancar() {
  if (animId || reducirMovimiento.matches || document.hidden) return;
  animId = requestAnimationFrame(fotograma);
}
function parar() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
}

window.addEventListener("resize", redimensionar);
document.addEventListener("visibilitychange", () => (document.hidden ? parar() : arrancar()));
reducirMovimiento.addEventListener?.("change", () => {
  if (reducirMovimiento.matches) { parar(); ctx.clearRect(0, 0, ancho, alto); } else arrancar();
});

redimensionar();
arrancar();