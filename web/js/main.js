import { a, ce, pf } from "./vendor/react.min.js";
import { tt, yf } from "./i18n.js";
import { Rf } from "./admin.js";
import { qt } from "./utils/fases.js";
import { $f, Ff, Hf, Wf, Zf } from "./sections.js";
import { $p, Wp } from "./explorar.js";
import { Kp } from "./packs.js";
import { AltaNegocio, Impacto, Precios } from "./negocio.js";
import { PanelPueblo } from "./pueblo.js";
import { AuthProvider, Gate, puedeAdmin, puedePanel } from "./auth.js";
import { irA, onEnlace } from "./utils/scroll.js";

function Vp() {
  const [f, v] = ce.useState(qt),
    [m, j] = ce.useState(null),
    [T, S] = ce.useState(!1),
    [M, b] = ce.useState(null),
    C = (J) => {
      (j(J), irA("mapa"));
    },
    O = (J) => {
      (b(J), irA("avisos"));
    },
    ne = () => S(!0);
  // Al entrar con un hash (#packs, #avisos…) o al volver de un panel, esperamos a que
  // el mapa y los packs ocupen su sitio antes de desplazarnos.
  ce.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => irA(id, { suave: !1 }), 350);
    return () => clearTimeout(t);
  }, []);
  return a.jsxs("div", {
    // Todos los enlaces internos pasan por irA (compensa la cabecera fija).
    onClickCapture: (J) => {
      const ae = J.target.closest && J.target.closest('a[href^="#"]');
      ae && !J.defaultPrevented && onEnlace({ currentTarget: ae, preventDefault: () => J.preventDefault() });
    },
    children: [
      a.jsx($f, { onMethod: ne }),
      a.jsxs("main", {
        children: [
          a.jsx(Wf, {
            onPick: (J) => {
              (v(qt), C(J));
            },
            onMethod: ne,
          }),
          a.jsx($p, { fecha: f, onFecha: v, sel: m, onSel: j, onMethod: ne, onAlert: O }),
          a.jsx(Kp, { fecha: f, onPick: C }),
          a.jsx(Ff, { preselect: M }),
          a.jsx(Zf, {}),
          a.jsx(Impacto, {}),
          a.jsx(Precios, {}),
          a.jsx(AltaNegocio, {}),
        ],
      }),
      a.jsx(Hf, { onMethod: ne }),
      a.jsx(Wp, { open: T, onClose: () => S(!1) }),
    ],
  });
}
const ruta = () => {
  const f = window.location.hash;
  return f.startsWith("#admin") ? "admin" : f.startsWith("#destino") ? "destino" : "web";
};
function Gp() {
  const { t: f } = tt(),
    [v, m] = ce.useState(ruta);
  ce.useEffect(() => {
    const j = () => {
      const T = ruta();
      m((S) => {
        if (S !== T) {
          const M = window.location.hash.slice(1);
          T !== "web"
            ? setTimeout(() => window.scrollTo(0, 0), 0)
            : setTimeout(() => (M && irA(M, { suave: !1 })) || window.scrollTo(0, 0), 350);
        }
        return T;
      });
    };
    return (window.addEventListener("hashchange", j), () => window.removeEventListener("hashchange", j));
  }, []);
  return v === "admin"
    ? a.jsx(Gate, { ok: puedeAdmin, lead: f("auth.adminLead"), children: a.jsx(Rf, {}) })
    : v === "destino"
      ? a.jsx(Gate, { ok: puedePanel, lead: f("pueblo.needLogin"), children: a.jsx(PanelPueblo, {}) })
      : a.jsx(Vp, {});
}
pf.createRoot(document.getElementById("root")).render(
  a.jsx(ce.StrictMode, {
    children: a.jsx(yf, { children: a.jsx(AuthProvider, { children: a.jsx(Gp, {}) }) }),
  }),
);
