// Inicio de sesión y registro. Demo sin servidor: las cuentas se guardan en
// localStorage con la contraseña resumida (SHA-256 + email como sal).
import { a, ce } from "./vendor/react.min.js";
import { tt } from "./i18n.js";
import { He } from "./components/icons.js";
import { destinosPanel } from "./data/pueblos.js";
import { config } from "./config.js";

const USUARIOS = "cf-usuarios",
  SESION = "cf-sesion",
  roles = ["viajero", "negocio", "ayuntamiento"],
  emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function resumen(email, pass) {
  const txt = `${email.toLowerCase()}::${pass}`;
  if (globalThis.crypto && crypto.subtle) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const c of txt) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return `x${h}`;
}
const leer = (k, def) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? def;
  } catch {
    return def;
  }
};
const escribir = (k, v) => {
  try {
    v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

// Cuentas de prueba (contraseña "demo1234"), solo con config.demo: en producción no existen.
const demo = config.demo
  ? [
      { email: "viajero@prueba.local", nombre: "Prueba viajero", rol: "viajero" },
      { email: "ayuntamiento@prueba.local", nombre: "Prueba ayuntamiento", rol: "ayuntamiento", destinoId: "brihuega" },
      { email: "equipo@prueba.local", nombre: "Prueba equipo", rol: "equipo" },
    ]
  : [];
async function usuarios() {
  const u = leer(USUARIOS, []);
  for (const d of demo)
    u.some((x) => x.email === d.email) || u.push({ ...d, hash: await resumen(d.email, "demo1234"), demo: !0 });
  return u;
}
const publico = ({ hash, ...u }) => u;

const Ctx = ce.createContext(null);
function AuthProvider({ children: f }) {
  const [user, setUser] = ce.useState(() => leer(SESION, null)),
    [modal, setModal] = ce.useState(null),
    [aviso, setAviso] = ce.useState(null),
    v = ce.useMemo(
      () => ({
        user,
        abrir: (modo = "login") => setModal(modo),
        cerrar: () => setModal(null),
        modal,
        aviso,
        async login(email, pass) {
          const h = await resumen(email.trim(), pass),
            u = (await usuarios()).find((x) => x.email === email.trim().toLowerCase() && x.hash === h);
          if (!u) throw new Error("errLogin");
          const p = publico(u);
          (escribir(SESION, p), setUser(p), setModal(null), setAviso(p.nombre));
          return p;
        },
        async registrar({ nombre, email, pass, rol, destinoId }) {
          const e = email.trim().toLowerCase(),
            lista = await usuarios();
          if (lista.some((x) => x.email === e)) throw new Error("errExists");
          const u = {
            email: e,
            nombre: nombre.trim(),
            rol,
            destinoId: rol === "ayuntamiento" ? destinoId : void 0,
            creadoEn: new Date().toISOString(),
            hash: await resumen(e, pass),
          };
          escribir(USUARIOS, [...lista.filter((x) => !x.demo), u]);
          const p = publico(u);
          (escribir(SESION, p), setUser(p), setModal(null), setAviso(p.nombre));
          return p;
        },
        logout() {
          (escribir(SESION, null), setUser(null));
        },
      }),
      [user, modal, aviso],
    );
  ce.useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(t);
  }, [aviso]);
  return a.jsxs(Ctx.Provider, { value: v, children: [f, a.jsx(AuthModal, {}), a.jsx(Toast, {})] });
}
function useAuth() {
  const f = ce.useContext(Ctx);
  if (!f) throw new Error("useAuth outside AuthProvider");
  return f;
}

function Toast() {
  const { t: f } = tt(),
    { aviso: v } = useAuth();
  return v
    ? a.jsxs("p", { className: "toast", role: "status", children: [a.jsx(He, { name: "check", size: 18 }), f("auth.welcome", { name: v })] })
    : null;
}

function AuthModal() {
  const { t: f } = tt(),
    au = useAuth(),
    ref = ce.useRef(null),
    modo = au.modal,
    [form, setForm] = ce.useState({ nombre: "", email: "", pass: "", pass2: "", rol: "viajero", destinoId: destinosPanel[0].id }),
    [err, setErr] = ce.useState(null),
    [ocupado, setOcupado] = ce.useState(!1),
    set = (k) => (e) => setForm((x) => ({ ...x, [k]: e.target.value }));
  ce.useEffect(() => {
    const d = ref.current;
    d && (modo && !d.open && d.showModal(), !modo && d.open && d.close());
    setErr(null);
  }, [modo]);
  const reg = modo === "register",
    enviar = async (e) => {
      e.preventDefault();
      const em = form.email.trim();
      if (!emailOk(em)) return setErr("errEmail");
      if (reg) {
        if (!form.nombre.trim()) return setErr("errName");
        if (form.pass.length < 6) return setErr("errPass");
        if (form.pass !== form.pass2) return setErr("errMatch");
      }
      setOcupado(!0);
      try {
        reg ? await au.registrar({ ...form, email: em }) : await au.login(em, form.pass);
        setForm((x) => ({ ...x, pass: "", pass2: "" }));
      } catch (x) {
        setErr(x.message);
      } finally {
        setOcupado(!1);
      }
    },
    probar = (em) => setForm((x) => ({ ...x, email: em, pass: "demo1234" }));
  return a.jsx("dialog", {
    ref,
    className: "modal auth",
    "aria-labelledby": "auth-title",
    onClose: au.cerrar,
    onClick: (e) => e.target === ref.current && au.cerrar(),
    children: a.jsxs("div", {
      className: "modal__inner auth__inner",
      children: [
        a.jsxs("div", {
          className: "modal__head",
          children: [
            a.jsx("h2", { id: "auth-title", className: "h2", children: f(reg ? "auth.register" : "auth.login") }),
            a.jsx("button", { type: "button", className: "icon-btn", "aria-label": f("auth.close"), onClick: au.cerrar, children: a.jsx(He, { name: "x" }) }),
          ],
        }),
        a.jsx("div", {
          className: "segmented auth__tabs",
          role: "tablist",
          children: ["login", "register"].map((m) =>
            a.jsx(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": modo === m,
                className: modo === m ? "is-on" : "",
                onClick: () => au.abrir(m),
                children: f(`auth.${m}`),
              },
              m,
            ),
          ),
        }),
        a.jsxs("form", {
          className: "auth__form",
          onSubmit: enviar,
          noValidate: !0,
          children: [
            reg &&
              a.jsxs("label", {
                className: "field field--light",
                children: [f("auth.name"), a.jsx("input", { value: form.nombre, onChange: set("nombre"), autoComplete: "name", required: !0 })],
              }),
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("auth.email"),
                a.jsx("input", { type: "email", value: form.email, onChange: set("email"), autoComplete: "email", required: !0, placeholder: "tu@email.com" }),
              ],
            }),
            a.jsxs("label", {
              className: "field field--light",
              children: [
                f("auth.password"),
                a.jsx("input", {
                  type: "password",
                  value: form.pass,
                  onChange: set("pass"),
                  autoComplete: reg ? "new-password" : "current-password",
                  required: !0,
                }),
              ],
            }),
            reg &&
              a.jsxs(a.Fragment, {
                children: [
                  a.jsxs("label", {
                    className: "field field--light",
                    children: [
                      f("auth.password2"),
                      a.jsx("input", { type: "password", value: form.pass2, onChange: set("pass2"), autoComplete: "new-password", required: !0 }),
                    ],
                  }),
                  a.jsxs("label", {
                    className: "field field--light",
                    children: [
                      f("auth.role"),
                      a.jsx("select", {
                        value: form.rol,
                        onChange: set("rol"),
                        children: roles.map((r) => a.jsx("option", { value: r, children: f(`auth.roles.${r}`) }, r)),
                      }),
                    ],
                  }),
                  form.rol === "ayuntamiento" &&
                    a.jsxs("label", {
                      className: "field field--light",
                      children: [
                        f("auth.destino"),
                        a.jsx("select", {
                          value: form.destinoId,
                          onChange: set("destinoId"),
                          children: destinosPanel.map((d) => a.jsx("option", { value: d.id, children: d.nombre }, d.id)),
                        }),
                      ],
                    }),
                ],
              }),
            err && a.jsxs("p", { role: "alert", className: "notice notice--bad", children: [a.jsx(He, { name: "warn", size: 18 }), f(`auth.${err}`)] }),
            a.jsx("button", {
              type: "submit",
              className: "btn btn--primary auth__submit",
              disabled: ocupado,
              children: f(reg ? "auth.submitRegister" : "auth.submitLogin"),
            }),
            a.jsxs("p", {
              className: "small muted auth__switch",
              children: [
                f(reg ? "auth.haveAccount" : "auth.noAccount"),
                " ",
                a.jsx("button", {
                  type: "button",
                  className: "link-button",
                  onClick: () => au.abrir(reg ? "login" : "register"),
                  children: f(reg ? "auth.switchLogin" : "auth.switchRegister"),
                }),
              ],
            }),
          ],
        }),
        !reg &&
          demo.length > 0 &&
          a.jsxs("div", {
            className: "auth__demo",
            children: [
              a.jsx("p", { className: "small", children: f("auth.demo") }),
              a.jsx("div", {
                className: "chips",
                children: demo.map((d) =>
                  a.jsx("button", { type: "button", className: "chip", onClick: () => probar(d.email), children: f(`auth.roles.${d.rol}`) }, d.email),
                ),
              }),
            ],
          }),
        a.jsx("p", { className: "small muted", children: f("auth.demoNote") }),
      ],
    }),
  });
}

const puedePanel = (u) => !!u && (u.rol === "ayuntamiento" || u.rol === "equipo"),
  // El panel interno usa datos de ejemplo: solo existe en modo demo.
  puedeAdmin = (u) => config.demo && !!u && u.rol === "equipo";

// Botón de la cabecera: «Entrar» o el menú de la cuenta.
function UserMenu() {
  const { t: f } = tt(),
    { user: u, abrir, logout } = useAuth(),
    [open, setOpen] = ce.useState(!1),
    ref = ce.useRef(null);
  ce.useEffect(() => {
    if (!open) return;
    const fuera = (e) => ref.current && !ref.current.contains(e.target) && setOpen(!1),
      esc = (e) => e.key === "Escape" && setOpen(!1);
    return (
      document.addEventListener("pointerdown", fuera),
      document.addEventListener("keydown", esc),
      () => (document.removeEventListener("pointerdown", fuera), document.removeEventListener("keydown", esc))
    );
  }, [open]);
  if (!u)
    return a.jsxs("button", {
      type: "button",
      className: "btn btn--ghost btn--sm user-btn",
      onClick: () => abrir("login"),
      children: [a.jsx(He, { name: "user", size: 18 }), a.jsx("span", { children: f("nav.login") })],
    });
  const ini = u.nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
  return a.jsxs("div", {
    className: "user-menu",
    ref,
    children: [
      a.jsxs("button", {
        type: "button",
        className: "user-menu__btn",
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-label": f("nav.account"),
        onClick: () => setOpen((x) => !x),
        children: [a.jsx("span", { className: "avatar", children: ini }), a.jsx(He, { name: "chevronDown", size: 16 })],
      }),
      open &&
        a.jsxs("div", {
          className: "user-menu__pop",
          role: "menu",
          children: [
            a.jsxs("p", {
              className: "user-menu__who",
              children: [a.jsx("strong", { children: u.nombre }), a.jsx("span", { className: "small muted", children: `${f(`auth.roles.${u.rol}`)} · ${u.email}` })],
            }),
            puedePanel(u) && a.jsx("a", { role: "menuitem", href: `#destino${u.destinoId ? `=${u.destinoId}` : ""}`, onClick: () => setOpen(!1), children: f("auth.panel") }),
            puedeAdmin(u) && a.jsx("a", { role: "menuitem", href: "#admin", onClick: () => setOpen(!1), children: f("auth.admin") }),
            a.jsxs("button", {
              type: "button",
              role: "menuitem",
              onClick: () => (setOpen(!1), logout()),
              children: [a.jsx(He, { name: "chevronLeft", size: 16 }), f("auth.logout")],
            }),
          ],
        }),
    ],
  });
}

// Pantalla para páginas con acceso restringido.
function Gate({ ok, lead, children: c }) {
  const { t: f } = tt(),
    { user: u, abrir, logout } = useAuth();
  if (ok(u)) return c;
  return a.jsx("main", {
    className: "admin-login",
    children: a.jsxs("div", {
      className: "admin-card",
      children: [
        a.jsx("p", { className: "brand__name", children: f("brand") }),
        a.jsx("h1", { className: "h2", children: f(u ? "auth.needRole" : "auth.needLogin") }),
        a.jsx("p", { className: "muted", children: lead }),
        u
          ? a.jsx("button", { type: "button", className: "btn btn--ghost", onClick: logout, children: f("auth.logout") })
          : a.jsx("button", { type: "button", className: "btn btn--primary", onClick: () => abrir("login"), children: f("auth.login") }),
        a.jsxs("a", { href: "#top", className: "link-button", children: [f("pueblo.back")] }),
      ],
    }),
  });
}

export { AuthProvider, Gate, UserMenu, puedeAdmin, puedePanel, useAuth };
