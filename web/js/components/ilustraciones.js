import { a } from "../vendor/react.min.js";

const Ws = (f) => Array.from({ length: f }, (v, m) => m);
function Tp() {
  const f = "M0 0 C-11 -6 -14 -22 -6 -30 L0 -25 L6 -30 C14 -22 11 -6 0 0Z",
    v = (m, j, T, S) =>
      a.jsxs("g", {
        transform: `translate(${m} ${j}) rotate(${S}) scale(${T})`,
        children: [
          Ws(5).map((M) =>
            a.jsx(
              "path",
              {
                d: f,
                transform: `rotate(${M * 72})`,
                fill: "#FBD3DE",
                stroke: "#E68AA6",
                strokeWidth: "1.2",
              },
              M,
            ),
          ),
          Ws(9).map((M) => {
            const b = (M * 40 * Math.PI) / 180;
            return a.jsxs(
              "g",
              {
                children: [
                  a.jsx("line", {
                    x1: "0",
                    y1: "0",
                    x2: Math.cos(b) * 11,
                    y2: Math.sin(b) * 11,
                    stroke: "#C2185B",
                    strokeWidth: "1",
                  }),
                  a.jsx("circle", {
                    cx: Math.cos(b) * 11,
                    cy: Math.sin(b) * 11,
                    r: "1.4",
                    fill: "#F9C74F",
                  }),
                ],
              },
              M,
            );
          }),
          a.jsx("circle", { r: "4", fill: "#D94A75" }),
        ],
      });
  return a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", {
        d: "M4 112 C30 92 48 80 70 66 C86 56 100 40 116 18",
        fill: "none",
        stroke: "#5B3A2E",
        strokeWidth: "6",
        strokeLinecap: "round",
      }),
      a.jsx("path", {
        d: "M58 74 C60 60 56 50 48 40",
        fill: "none",
        stroke: "#5B3A2E",
        strokeWidth: "3.5",
        strokeLinecap: "round",
      }),
      a.jsx("path", {
        d: "M92 47 C100 54 108 56 116 56",
        fill: "none",
        stroke: "#5B3A2E",
        strokeWidth: "3",
        strokeLinecap: "round",
      }),
      a.jsx("ellipse", {
        cx: "111",
        cy: "56",
        rx: "4",
        ry: "6",
        transform: "rotate(70 111 56)",
        fill: "#E68AA6",
      }),
      a.jsx("ellipse", {
        cx: "45",
        cy: "36",
        rx: "3.5",
        ry: "5.5",
        transform: "rotate(-30 45 36)",
        fill: "#E68AA6",
      }),
      v(30, 92, 0.9, 10),
      v(66, 62, 1.15, -8),
      v(98, 30, 0.85, 20),
    ],
  });
}
function Np() {
  const f = "M0 0 C-14 -4 -16 -27 0 -29 C16 -27 14 -4 0 0Z",
    v = "M0 0 C-6 -2 -7 -12 0 -13 C7 -12 6 -2 0 0Z",
    m = (j, T, S, M) =>
      a.jsxs("g", {
        transform: `translate(${j} ${T}) rotate(${M}) scale(${S})`,
        children: [
          Ws(5).map((b) =>
            a.jsxs(
              "g",
              {
                transform: `rotate(${b * 72})`,
                children: [
                  a.jsx("path", { d: f, fill: "#FFF6F8", stroke: "#E7B3C2", strokeWidth: "1.2" }),
                  a.jsx("path", { d: v, fill: "#F2A1B8" }),
                ],
              },
              b,
            ),
          ),
          Ws(12).map((b) => {
            const C = (b * 30 * Math.PI) / 180,
              O = b % 2 ? 13 : 16;
            return a.jsxs(
              "g",
              {
                children: [
                  a.jsx("line", {
                    x1: "0",
                    y1: "0",
                    x2: Math.cos(C) * O,
                    y2: Math.sin(C) * O,
                    stroke: "#9C2C55",
                    strokeWidth: "0.9",
                  }),
                  a.jsx("circle", {
                    cx: Math.cos(C) * O,
                    cy: Math.sin(C) * O,
                    r: "1.3",
                    fill: "#7A3B12",
                  }),
                ],
              },
              b,
            );
          }),
          a.jsx("circle", { r: "3.6", fill: "#8E244D" }),
        ],
      });
  return a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", {
        d: "M8 22 C30 34 52 52 66 72 C78 90 92 102 114 110",
        fill: "none",
        stroke: "#4A3428",
        strokeWidth: "5",
        strokeLinecap: "round",
      }),
      a.jsx("path", {
        d: "M66 72 C74 62 86 56 100 54",
        fill: "none",
        stroke: "#4A3428",
        strokeWidth: "3",
        strokeLinecap: "round",
      }),
      a.jsx("circle", { cx: "102", cy: "53", r: "4", fill: "#F2A1B8" }),
      m(34, 38, 0.95, 15),
      m(80, 86, 1.1, -5),
      m(88, 50, 0.7, 30),
    ],
  });
}
function Lp() {
  const f = (v, m, j, T) => {
    const S = Ws(9).map((M) => {
      const b = m + M * 6.5,
        C = 3.2 + Math.min(M, 5) * 0.25,
        O = ["#5E35B1", "#7E57C2", "#9575CD"][M % 3];
      return a.jsxs(
        "g",
        {
          children: [
            a.jsx("ellipse", {
              cx: v + j * (M / 9) - C,
              cy: b,
              rx: C,
              ry: "2.6",
              transform: `rotate(-28 ${v - C} ${b})`,
              fill: O,
            }),
            a.jsx("ellipse", {
              cx: v + j * (M / 9) + C,
              cy: b + 2,
              rx: C,
              ry: "2.6",
              transform: `rotate(28 ${v + C} ${b + 2})`,
              fill: O,
            }),
          ],
        },
        M,
      );
    });
    return a.jsxs(
      "g",
      {
        children: [
          a.jsx("path", {
            d: `M${v + j} ${m + 60} C${v + j * 0.6} ${m + 80} ${v + j * 0.2} 100 60 116`,
            fill: "none",
            stroke: "#6E8B4E",
            strokeWidth: "2.4",
            strokeLinecap: "round",
          }),
          a.jsx("line", {
            x1: v,
            y1: m,
            x2: v + j,
            y2: m + 60,
            stroke: "#6E8B4E",
            strokeWidth: "2",
          }),
          S,
        ],
      },
      T,
    );
  };
  return a.jsxs(a.Fragment, {
    children: [
      f(36, 14, 14, 1),
      f(62, 6, 0, 2),
      f(88, 16, -14, 3),
      a.jsx("path", {
        d: "M60 116 C46 106 34 100 20 98",
        fill: "none",
        stroke: "#8FA67A",
        strokeWidth: "3",
        strokeLinecap: "round",
      }),
      a.jsx("path", {
        d: "M60 116 C74 106 88 102 104 100",
        fill: "none",
        stroke: "#8FA67A",
        strokeWidth: "3",
        strokeLinecap: "round",
      }),
    ],
  });
}
function Mp() {
  const f = (v, m, j, T, S, M) =>
    a.jsxs(
      "g",
      {
        transform: `translate(${v} ${m}) rotate(${j})`,
        children: [
          a.jsx("path", {
            d: "M0 0 C9 -3 15 -10 17 -18 C18 -24 18 -32 14 -40 C11 -46 6 -52 0 -60 C-6 -52 -11 -46 -14 -40 C-18 -32 -18 -24 -17 -18 C-15 -10 -9 -3 0 0Z",
            fill: T,
            stroke: S,
            strokeWidth: "1.2",
          }),
          a.jsx("line", { x1: "0", y1: "4", x2: "0", y2: "-58", stroke: S, strokeWidth: "1.4" }),
          Ws(7).map((b) => {
            const C = -8 - b * 6.5,
              O = [12, 15, 16, 15, 13, 10, 6][b];
            return a.jsxs(
              "g",
              {
                stroke: S,
                strokeWidth: "0.9",
                children: [
                  a.jsx("line", { x1: "0", y1: C, x2: O, y2: C - 7 }),
                  a.jsx("line", { x1: "0", y1: C, x2: -O, y2: C - 7 }),
                ],
              },
              b,
            );
          }),
        ],
      },
      M,
    );
  return a.jsxs(a.Fragment, {
    children: [
      a.jsx("path", {
        d: "M60 116 C60 100 58 90 56 82",
        fill: "none",
        stroke: "#6B4423",
        strokeWidth: "3",
        strokeLinecap: "round",
      }),
      f(56, 84, -38, "#E8A33A", "#9A5B1A", 1),
      f(58, 84, 34, "#C8662B", "#7A3416", 2),
      f(57, 80, -2, "#A8411E", "#5E2410", 3),
      a.jsxs("g", {
        transform: "translate(92 98)",
        children: [
          a.jsx("path", { d: "M0 0 L-7 -10 L0 -16 L7 -10Z", fill: "#7A5230" }),
          a.jsx("path", {
            d: "M0 -16 L-3 -20 M0 -16 L3 -20 M-7 -10 L-11 -11 M7 -10 L11 -11",
            stroke: "#7A5230",
            strokeWidth: "1.2",
          }),
        ],
      }),
    ],
  });
}
const zp = { cerezo: Tp, almendro: Np, lavanda: Lp, haya: Mp };
function jh({ kind: f, size: v = 120, className: m }) {
  const j = zp[f];
  return a.jsx("svg", {
    "aria-hidden": "true",
    width: v,
    height: v,
    viewBox: "0 0 120 120",
    className: m,
    children: a.jsx(j, {}),
  });
}

export { jh };
