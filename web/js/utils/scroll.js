// Desplazamiento a secciones teniendo en cuenta la cabecera fija, que cambia
// de alto según el ancho de pantalla (en móvil el menú baja a una segunda fila).
import { ce } from "../vendor/react.min.js";

const alturaCabecera = () => {
  const h = document.querySelector(".site-header");
  return h ? h.getBoundingClientRect().height : 0;
};

function irA(id, { suave = !0 } = {}) {
  const el = document.getElementById(id);
  if (!el) return !1;
  const y = el.getBoundingClientRect().top + window.scrollY - alturaCabecera() - 8;
  window.scrollTo({ top: Math.max(0, y), behavior: suave ? "smooth" : "instant" });
  return !0;
}

// Enlace interno: cambia el hash sin el salto nativo del navegador.
function onEnlace(e) {
  const href = e.currentTarget.getAttribute("href") || "";
  if (!href.startsWith("#") || href.startsWith("#admin") || href.startsWith("#destino")) return;
  const id = href.slice(1) || "top";
  if (!document.getElementById(id)) return;
  e.preventDefault();
  history.pushState(null, "", href);
  irA(id);
}

// Qué sección está a la vista, para marcar el enlace activo del menú.
function useSeccionActiva(ids) {
  const [act, setAct] = ce.useState(null),
    clave = ids.join(",");
  ce.useEffect(() => {
    const calc = () => {
      const lim = alturaCabecera() + Math.min(160, window.innerHeight * 0.25);
      let actual = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        el && el.getBoundingClientRect().top <= lim && (actual = id);
      }
      setAct(actual);
    };
    calc();
    window.addEventListener("scroll", calc, { passive: !0 });
    window.addEventListener("resize", calc);
    return () => (window.removeEventListener("scroll", calc), window.removeEventListener("resize", calc));
  }, [clave]);
  return act;
}

export { alturaCabecera, irA, onEnlace, useSeccionActiva };
