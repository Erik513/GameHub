import { expect, it } from "vitest";
import { lineGlyphs } from "./glyphs";

/** The points of an SVG path (curves and arcs sampled), to find how far the drawing reaches. */
function pointsOf(d: string): [number, number][] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const pts: [number, number][] = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let lcx = 0;
  let lcy = 0;
  const num = () => Number(tokens[i++]);
  const add = (px: number, py: number) => pts.push([px, py]);
  const cubic = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ) => {
    for (let t = 0; t <= 1; t += 0.02) {
      const m = 1 - t;
      add(
        m ** 3 * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t ** 3 * x3,
        m ** 3 * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t ** 3 * y3,
      );
    }
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i]!)) cmd = tokens[i++]!;
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "Z") {
      x = sx;
      y = sy;
      add(x, y);
      continue;
    }
    if (C === "M" || C === "L") {
      const nx = num() + (rel ? x : 0);
      const ny = num() + (rel ? y : 0);
      x = nx;
      y = ny;
      if (C === "M") {
        sx = x;
        sy = y;
        cmd = rel ? "l" : "L";
      }
      add(x, y);
    } else if (C === "H") {
      x = num() + (rel ? x : 0);
      add(x, y);
    } else if (C === "V") {
      y = num() + (rel ? y : 0);
      add(x, y);
    } else if (C === "C") {
      const x1 = num() + (rel ? x : 0),
        y1 = num() + (rel ? y : 0),
        x2 = num() + (rel ? x : 0),
        y2 = num() + (rel ? y : 0),
        x3 = num() + (rel ? x : 0),
        y3 = num() + (rel ? y : 0);
      cubic(x, y, x1, y1, x2, y2, x3, y3);
      lcx = x2;
      lcy = y2;
      x = x3;
      y = y3;
    } else if (C === "S") {
      const x1 = 2 * x - lcx,
        y1 = 2 * y - lcy;
      const x2 = num() + (rel ? x : 0),
        y2 = num() + (rel ? y : 0),
        x3 = num() + (rel ? x : 0),
        y3 = num() + (rel ? y : 0);
      cubic(x, y, x1, y1, x2, y2, x3, y3);
      lcx = x2;
      lcy = y2;
      x = x3;
      y = y3;
    } else if (C === "Q") {
      const x1 = num() + (rel ? x : 0),
        y1 = num() + (rel ? y : 0),
        x2 = num() + (rel ? x : 0),
        y2 = num() + (rel ? y : 0);
      cubic(
        x,
        y,
        x + (2 / 3) * (x1 - x),
        y + (2 / 3) * (y1 - y),
        x2 + (2 / 3) * (x1 - x2),
        y2 + (2 / 3) * (y1 - y2),
        x2,
        y2,
      );
      x = x2;
      y = y2;
    } else if (C === "A") {
      let rx = Math.abs(num()),
        ry = Math.abs(num());
      const phi = (num() * Math.PI) / 180,
        large = num(),
        sweep = num();
      const x2 = num() + (rel ? x : 0),
        y2 = num() + (rel ? y : 0);
      // Center parametrisation of the SVG arc.
      const dx = (x - x2) / 2,
        dy = (y - y2) / 2;
      const x1p = Math.cos(phi) * dx + Math.sin(phi) * dy,
        y1p = -Math.sin(phi) * dx + Math.cos(phi) * dy;
      const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
      if (lam > 1) {
        rx *= Math.sqrt(lam);
        ry *= Math.sqrt(lam);
      }
      const sign = large === sweep ? -1 : 1;
      const num2 = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
      const co = sign * Math.sqrt(Math.max(0, num2 / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
      const cxp = (co * rx * y1p) / ry,
        cyp = (-co * ry * x1p) / rx;
      const cx = Math.cos(phi) * cxp - Math.sin(phi) * cyp + (x + x2) / 2,
        cy = Math.sin(phi) * cxp + Math.cos(phi) * cyp + (y + y2) / 2;
      const ang = (ux: number, uy: number, vx: number, vy: number) =>
        Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
      const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
      let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
      if (!sweep && dt > 0) dt -= 2 * Math.PI;
      if (sweep && dt < 0) dt += 2 * Math.PI;
      for (let k = 0; k <= 60; k++) {
        const t = t1 + (dt * k) / 60;
        add(
          cx + rx * Math.cos(t) * Math.cos(phi) - ry * Math.sin(t) * Math.sin(phi),
          cy + rx * Math.cos(t) * Math.sin(phi) + ry * Math.sin(t) * Math.cos(phi),
        );
      }
      x = x2;
      y = y2;
    } else {
      throw new Error("unknown command " + cmd + " in " + d);
    }
  }
  return pts;
}

it("keeps every drawing with its stroke inside the 24 units of its box, so no part is cut off", () => {
  const cut: string[] = [];
  for (const [name, paths] of Object.entries(lineGlyphs)) {
    const pts = (paths as readonly string[]).flatMap(pointsOf);
    // The stroke is 2 wide with round ends: it reaches 1 beyond the path.
    const minX = Math.min(...pts.map((p) => p[0])) - 1;
    const maxX = Math.max(...pts.map((p) => p[0])) + 1;
    const minY = Math.min(...pts.map((p) => p[1])) - 1;
    const maxY = Math.max(...pts.map((p) => p[1])) + 1;
    if (Math.max(0 - minX, maxX - 24, 0 - minY, maxY - 24) > 0.05) cut.push(name);
  }
  expect(cut).toEqual([]);
});
