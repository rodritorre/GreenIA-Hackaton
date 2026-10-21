import { a, ce, pf } from "./vendor/react.min.js";
import { yf } from "./i18n.js";
import { Rf } from "./admin.js";
import { qt } from "./utils/fases.js";
import { $f, Bf, Ff, Hf, Wf, Zf } from "./sections.js";
import { $p, Wp } from "./explorar.js";
import { Kp } from "./packs.js";

const Jd = (f) => {
  var v;
  return (v = document.getElementById(f)) == null
    ? void 0
    : v.scrollIntoView({ behavior: "smooth" });
};
function Vp() {
  const [f, v] = ce.useState(qt),
    [m, j] = ce.useState(null),
    [T, S] = ce.useState(!1),
    [M, b] = ce.useState(null),
    C = (J) => {
      (j(J), Jd("mapa"));
    },
    O = (J) => {
      (b(J), Jd("avisos"));
    },
    ne = () => S(!0);
  return a.jsxs(a.Fragment, {
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
          a.jsx(Bf, {}),
        ],
      }),
      a.jsx(Hf, { onMethod: ne }),
      a.jsx(Wp, { open: T, onClose: () => S(!1) }),
    ],
  });
}
const eh = () => window.location.hash.startsWith("#admin");
function Gp() {
  const [f, v] = ce.useState(eh);
  return (
    ce.useEffect(() => {
      const m = () => {
        const j = eh();
        v((T) => (T !== j && window.scrollTo(0, 0), j));
      };
      return (
        window.addEventListener("hashchange", m),
        () => window.removeEventListener("hashchange", m)
      );
    }, []),
    f ? a.jsx(Rf, {}) : a.jsx(Vp, {})
  );
}
pf.createRoot(document.getElementById("root")).render(
  a.jsx(ce.StrictMode, { children: a.jsx(yf, { children: a.jsx(Gp, {}) }) }),
);
