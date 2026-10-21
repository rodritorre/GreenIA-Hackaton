import { a } from "../vendor/react.min.js";

const xf = {
  chevronRight: a.jsx("path", { d: "M9 6l6 6-6 6" }),
  chevronLeft: a.jsx("path", { d: "M15 6l-6 6 6 6" }),
  search: a.jsxs(a.Fragment, {
    children: [
      a.jsx("circle", { cx: "11", cy: "11", r: "7" }),
      a.jsx("path", { d: "M20 20l-4-4" }),
    ],
  }),
  plus: a.jsx("path", { d: "M12 5v14M5 12h14" }),
  minus: a.jsx("path", { d: "M5 12h14" }),
  expand: a.jsx("path", { d: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" }),
  bell: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
      a.jsx("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" }),
    ],
  }),
  bed: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M3 18V7M3 13h18v5M21 13a4 4 0 0 0-4-4h-6v4" }),
      a.jsx("circle", { cx: "7", cy: "10", r: "1.6" }),
    ],
  }),
  compass: a.jsxs(a.Fragment, {
    children: [
      a.jsx("circle", { cx: "12", cy: "12", r: "9" }),
      a.jsx("path", { d: "M15.5 8.5l-2 5-5 2 2-5z" }),
    ],
  }),
  satellite: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M13 7l4 4M5 15l4 4M9 11l4 4" }),
      a.jsx("path", { d: "M11 9l3-3 4 4-3 3zM7 13l-3 3 4 4 3-3" }),
      a.jsx("path", { d: "M17 17a3 3 0 0 0 3-3M17 21a7 7 0 0 0 7-7" }),
    ],
  }),
  info: a.jsxs(a.Fragment, {
    children: [
      a.jsx("circle", { cx: "12", cy: "12", r: "9" }),
      a.jsx("path", { d: "M12 11v5M12 8h.01" }),
    ],
  }),
  calc: a.jsxs(a.Fragment, {
    children: [
      a.jsx("rect", { x: "5", y: "3", width: "14", height: "18", rx: "2" }),
      a.jsx("path", { d: "M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4" }),
    ],
  }),
  book: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" }),
      a.jsx("path", { d: "M4 19V5" }),
    ],
  }),
  tag: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M3 12V4h8l10 10-8 8z" }),
      a.jsx("circle", { cx: "7.5", cy: "8.5", r: "1.3" }),
    ],
  }),
  camera: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M4 8h3l2-3h6l2 3h3v11H4z" }),
      a.jsx("circle", { cx: "12", cy: "13", r: "3.5" }),
    ],
  }),
  check: a.jsx("path", { d: "M5 12.5l4.5 4.5L19 7.5" }),
  x: a.jsx("path", { d: "M6 6l12 12M18 6L6 18" }),
  warn: a.jsxs(a.Fragment, {
    children: [a.jsx("path", { d: "M12 4l9 16H3z" }), a.jsx("path", { d: "M12 10v4M12 17h.01" })],
  }),
  refresh: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M20 11a8 8 0 0 0-14.6-4.5L4 8" }),
      a.jsx("path", { d: "M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16" }),
      a.jsx("path", { d: "M20 20v-4h-4" }),
    ],
  }),
  layers: a.jsxs(a.Fragment, {
    children: [a.jsx("path", { d: "M12 3l9 5-9 5-9-5z" }), a.jsx("path", { d: "M3 13l9 5 9-5" })],
  }),
  pin: a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", { d: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" }),
      a.jsx("circle", { cx: "12", cy: "9.5", r: "2.5" }),
    ],
  }),
  mail: a.jsxs(a.Fragment, {
    children: [
      a.jsx("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
      a.jsx("path", { d: "M3 7l9 6 9-6" }),
    ],
  }),
  arrowRight: a.jsx("path", { d: "M5 12h14M13 6l6 6-6 6" }),
  chevronDown: a.jsx("path", { d: "M6 9l6 6 6-6" }),
  calendar: a.jsxs(a.Fragment, {
    children: [
      a.jsx("rect", { x: "3.5", y: "5", width: "17", height: "15.5", rx: "2" }),
      a.jsx("path", { d: "M3.5 10h17M8 3v4M16 3v4" }),
    ],
  }),
  user: a.jsxs(a.Fragment, {
    children: [
      a.jsx("circle", { cx: "12", cy: "8", r: "4" }),
      a.jsx("path", { d: "M4.5 21a7.5 7.5 0 0 1 15 0" }),
    ],
  }),
  utensils: a.jsx("path", {
    d: "M7 3v18M4 3v5a3 3 0 0 0 6 0V3M18 21V3c-2.2 1.2-3.5 3.8-3.5 7v3H18",
  }),
  phone: a.jsx("path", {
    d: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  }),
  external: a.jsx("path", { d: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" }),
  database: a.jsxs(a.Fragment, {
    children: [
      a.jsx("ellipse", { cx: "12", cy: "6", rx: "7", ry: "3" }),
      a.jsx("path", { d: "M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" }),
    ],
  }),
};
function He({ name: f, size: v = 20, className: m }) {
  return a.jsx("svg", {
    "aria-hidden": "true",
    width: v,
    height: v,
    viewBox: "0 0 24 24",
    className: m,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: xf[f],
  });
}
function rh({ size: f = 32, className: v }) {
  const m = "M0 0 C-4 -2 -5 -8 -2.2 -11 L0 -9.2 L2.2 -11 C5 -8 4 -2 0 0Z";
  return a.jsxs("svg", {
    "aria-hidden": "true",
    width: f,
    height: f,
    viewBox: "0 0 32 32",
    className: v,
    children: [
      a.jsx("path", {
        d: "M5 30 C10 24 14 20 17 15",
        fill: "none",
        stroke: "#5B3A2E",
        strokeWidth: "2.2",
        strokeLinecap: "round",
      }),
      a.jsx("path", { d: "M11 22 C7 21 5 18 5 15 C9 15 11 18 11 22Z", fill: "var(--accent)" }),
      a.jsx("ellipse", {
        cx: "9",
        cy: "12",
        rx: "2",
        ry: "3",
        transform: "rotate(-25 9 12)",
        fill: "var(--logo)",
      }),
      a.jsxs("g", {
        transform: "translate(20 12)",
        children: [
          [0, 72, 144, 216, 288].map((j) =>
            a.jsx(
              "path",
              {
                d: m,
                transform: `rotate(${j})`,
                fill: "#FBD3DE",
                stroke: "var(--logo)",
                strokeWidth: "0.9",
              },
              j,
            ),
          ),
          a.jsx("circle", {
            r: "2.4",
            fill: "var(--sun)",
            stroke: "var(--logo)",
            strokeWidth: "0.8",
          }),
        ],
      }),
    ],
  });
}

export { He, rh };
