// The artwork for every product, as SVG in inches. Core on each one is the mark + apophenia.news; each adds one small idea that fits the object.
import fs from "node:fs";

const here = new URL(".", import.meta.url).pathname,
  NET = JSON.parse(fs.readFileSync(here + "hoodie-net.json"));
export const C = { indigo: "#4f46e5", sky: "#0ea5e9", ink: "#111827", text: "#15151b", white: "#f4f4f5", night: "#0b0d17", url: "#93b4f8" };
let uid = 0;
const f = (n) => +n.toFixed(4),
  rng = (a) => () => ((a = (a + 0x6d2b79f5) | 0), (a = Math.imul(a ^ (a >>> 15), 1 | a)), (a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a), ((a ^ (a >>> 14)) >>> 0) / 4294967296);

// ── the mark: light = the site logo, dark = the hoodie chest version (dark fill, white lines and hub)
export const logo = (cx, cy, s, dark = false, fill = dark ? C.night : "#fff") => {
  const id = `lg${uid++}`, line = dark ? "#fff" : C.ink;
  return `<g transform="translate(${f(cx - s / 2)} ${f(cy - s / 2)}) scale(${f(s / 120)})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.indigo}"/><stop offset="1" stop-color="${C.sky}"/></linearGradient></defs>
<rect x="6" y="6" width="108" height="108" rx="28" fill="${fill}" stroke="url(#${id})" stroke-width="8"/>
<path d="M36 36L84 84M84 36L36 84M36 36H84M36 84H84" stroke="${line}" stroke-opacity="${dark ? 0.8 : 0.6}" stroke-width="4" stroke-linecap="round"/>
<circle cx="36" cy="36" r="8" fill="${C.indigo}"/><circle cx="84" cy="36" r="8" fill="${C.sky}"/><circle cx="36" cy="84" r="8" fill="${C.sky}"/><circle cx="84" cy="84" r="8" fill="${C.indigo}"/><circle cx="60" cy="60" r="10" fill="${line}"/></g>`;
};
const word = (x, y, size, fill, anchor = "middle", extra = "") =>
  `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="GSF" font-weight="600" font-size="${f(size)}" letter-spacing="-0.005em" fill="${fill}" ${extra}>apophenia.news</text>`;
// hoodie-chest lockup: mark, then the name, centred as a whole on (cx, cy)
export const lockup = (cx, cy, h, { dark = false, fill, color = dark ? C.white : C.text } = {}) =>
  `<g data-cx="${f(cx)}" data-cy="${f(cy)}">${logo(h / 2, 0, h, dark, fill)}${word(h * 1.2, h * 0.155, h * 0.44, color, "start")}</g>`;
export const stacked = (cx, top, s, { dark = false, fill, color = dark ? C.white : C.text, size = s * 0.27, gap = s * 0.34 } = {}) =>
  logo(cx, top + s / 2, s, dark, fill) + word(cx, top + s + gap + size * 0.72, size, color);

// ── Morse: a message as dots and dashes along a line (unit = dot length = stroke width)
const MORSE = { a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--.." };
export const morseUnits = (msg) => {
  const marks = [];
  let u = 0;
  for (const ch of msg) {
    if (ch === " ") { u += 4; continue; }
    for (const s of MORSE[ch]) marks.push([u, s === "." ? 1 : 3]), (u += (s === "." ? 1 : 3) + 1);
    u += 2;
  }
  return { marks, len: u - 3 };
};
// draws msg from (x0,y0) towards (x1,y1), stretched to fill the segment
export const morse = (msg, x0, y0, x1, y1, { w, color, opacity = 1, fit = true, unit } = {}) => {
  const { marks, len } = morseUnits(msg), L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, k = fit ? L / len : unit;
  return `<path d="${marks.map(([a, l]) => { const s = a * k + w / 2, e = (a + l) * k - w / 2; return `M${f(x0 + ux * s)} ${f(y0 + uy * s)}L${f(x0 + ux * Math.max(s, e))} ${f(y0 + uy * Math.max(s, e))}`; }).join("")}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/>`;
};

// ── networks: nodes {x,y,r,c,ring,hub} + edges [i,j]; on a wrap, edges may cross the seam (drawn twice, shifted)
const drawNet = (nodes, edges, { line, lineOp, lw, hub, wrapW = 0, halo = 0, bg }) => {
  let s = `<g stroke="${line}" stroke-opacity="${lineOp}" stroke-width="${f(lw)}" stroke-linecap="round">`;
  for (const [i, j] of edges) {
    const p = nodes[i], q = nodes[j];
    let qx = q.x;
    if (wrapW) qx += Math.abs(q.x - p.x) > wrapW / 2 ? (q.x > p.x ? -wrapW : wrapW) : 0;
    for (const sh of wrapW && qx !== q.x ? [0, qx < q.x ? wrapW : -wrapW] : [0]) s += `<line x1="${f(p.x + sh)}" y1="${f(p.y)}" x2="${f(qx + sh)}" y2="${f(q.y)}"/>`;
  }
  s += "</g>";
  for (const n of nodes) {
    const c = n.hub ? hub : n.c;
    if (halo) s += `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r + halo)}" fill="${bg}"/>`;
    s += n.ring ? `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r * 0.82)}" fill="none" stroke="${c}" stroke-width="${f(n.r * 0.36)}"/>` : `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r)}" fill="${c}"/>`;
  }
  return s;
};
// the hoodie's back constellation, w inches wide, top-left at (x, y)
const hoodieNet = (x, y, w, o) => {
  const xs = NET.nodes.map((n) => n.x), ys = NET.nodes.map((n) => n.y), x0 = Math.min(...xs), y0 = Math.min(...ys), k = w / (Math.max(...xs) - x0);
  const nodes = NET.nodes.map((n) => ({ x: x + (n.x - x0) * k, y: y + (n.y - y0) * k, r: n.r * k * 1.25, ring: n.ring, hub: n.rgb[0] > 200, c: n.rgb[2] - n.rgb[0] > 140 ? C.sky : C.indigo }));
  return { svg: drawNet(nodes, NET.edges, o), h: (Math.max(...ys) - y0) * k };
};
// a seamless band of nodes all the way round a wrap
const band = ({ W, y0, y1, dmin, dmax, seed, hubAt }) => {
  const R = rng(seed), wd = (a, b) => Math.hypot(Math.min(Math.abs(a.x - b.x), W - Math.abs(a.x - b.x)), a.y - b.y), nodes = [{ x: hubAt, y: (y0 + y1) / 2, hub: true }];
  for (let t = 0; t < 4000; t++) {
    const p = { x: R() * W, y: y0 + R() * (y1 - y0) };
    if (nodes.every((q) => wd(p, q) >= dmin)) nodes.push(p);
  }
  const pairs = [];
  nodes.forEach((p, i) => nodes.forEach((q, j) => j > i && wd(p, q) < dmax && pairs.push([wd(p, q), i, j])));
  pairs.sort((a, b) => (nodes[b[1]].hub || nodes[b[2]].hub) - (nodes[a[1]].hub || nodes[a[2]].hub) || a[0] - b[0]);
  const seg = (i, j) => { const p = nodes[i], q = nodes[j], qx = q.x + (Math.abs(q.x - p.x) > W / 2 ? (q.x > p.x ? -W : W) : 0); return [p.x, p.y, qx, q.y]; },
    cross = ([a, b, c, d], [e, g, h, k]) => {
      const o = (px, py, qx, qy, rx, ry) => Math.sign((qx - px) * (ry - py) - (qy - py) * (rx - px));
      return o(a, b, c, d, e, g) * o(a, b, c, d, h, k) < 0 && o(e, g, h, k, a, b) * o(e, g, h, k, c, d) < 0;
    },
    deg = nodes.map(() => 0), edges = [];
  for (const [, i, j] of pairs) {
    if (deg[i] > (nodes[i].hub ? 5 : 3) || deg[j] > (nodes[j].hub ? 5 : 3)) continue;
    const s = seg(i, j);
    if (edges.some(([a, b]) => a !== i && a !== j && b !== i && b !== j && [0, W, -W].some((sh) => { const t = seg(a, b); return cross(s, [t[0] + sh, t[1], t[2] + sh, t[3]]); }))) continue;
    edges.push([i, j]), deg[i]++, deg[j]++;
  }
  nodes.forEach((n, i) => { if (!n.hub) Object.assign(n, { r: [0.034, 0.042, 0.05][(R() * 3) | 0], c: R() < 0.5 ? C.indigo : C.sky, ring: i % 9 === 4 }); else n.r = 0.068; });
  return { nodes, edges };
};

// ── noise and the pattern found in it (all generated, seeded — no real-world data)
// the mark's five points, a little loose (jit = how far each corner wanders): tl, tr, bl, br, hub
const markPts = ({ cx, cy, w, h = w, jit = 0, seed = 3 }) => { const R = rng(seed), j = () => (R() - 0.5) * 2 * jit; return [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]].map(([a, b], i) => [cx + (a * w) / 2 + j() * (i < 4), cy + (b * h) / 2 + j() * (i < 4)]); },
  segDist = ([px, py], [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
// noise: n random dots in a box, nearly all tiny and faint; keeps clear of the found pattern (its points and lines) and of `avoid` circles [x, y, r]
const noise = ({ box: [x0, y0, x1, y1], n, seed, r = 0.1, op = 1, avoid = [], pts, lines = [], clear = 0.2 }) => {
  const R = rng(seed), [tl, tr, bl, br, c] = pts || [], segs = pts ? [[tl, tr], [bl, br], [tl, br], [tr, bl], ...lines] : lines;
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), k = R() ** 4;
    if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar) || segs.some(([a, b]) => segDist([x, y], a, b) < clear)) continue;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (0.14 + 0.4 * k))}" fill="#fff" fill-opacity="${f(Math.min(1, op * (0.22 + 0.5 * k)))}"/>`;
  }
  return s;
};
// the mark, found in the noise: its corner dots, hub, diagonals and bars, drawn big
const found = ({ pts: [tl, tr, bl, br, c], r, hubR = r * 1.1, lw, lineOp = 0.7, hub = "#fff" }) => {
  const P = ([x, y]) => `${f(x)} ${f(y)}`;
  return `<path d="M${P(tl)}L${P(tr)}M${P(bl)}L${P(br)}M${P(tl)}L${P(c)}L${P(br)}M${P(tr)}L${P(c)}L${P(bl)}" stroke="#fff" stroke-opacity="${lineOp}" stroke-width="${f(lw)}" stroke-linecap="round" fill="none"/>` +
    [[tl, C.indigo], [tr, C.sky], [bl, C.sky], [br, C.indigo]].map(([[x, y], col]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${col}"/>`).join("") +
    `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(hubR)}" fill="${hub}"/>`;
};
// carry the line from p through q on until it is `m` inches from the panel edge
const onward = ([px, py], [qx, qy], W, H, m) => { const dx = qx - px, dy = qy - py, t = Math.min(...[dx > 0 ? (W - m - qx) / dx : dx < 0 ? (m - qx) / dx : 1e9, dy > 0 ? (H - m - qy) / dy : dy < 0 ? (m - qy) / dy : 1e9]); return [qx + dx * t, qy + dy * t]; };
const font = (x, y, size, txt, fill, { w = 500, ls = "0.01em", anchor = "middle", op = 1 } = {}) =>
  `<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="SG" font-weight="${w}" font-size="${f(size)}" letter-spacing="${ls}" fill="${fill}" fill-opacity="${op}">${txt}</text>`;

// ───────────────────────────────── the products
export const pieces = {
  // Apophenia Mug (Fourthwall blank: White Glossy Mug), 9×3.5 in wrap. Handle-left view shows ~0–35%, handle-right ~65–100%.
  // Face A: the mark and name. Face B: the mark's skeleton pulled wide, nothing between. The bars are Morse: "apophenia" on top, "not crazy" below.
  mug: {
    W: 9, H: 3.5, bg: "#fff",
    svg: () => {
      const A = 2.0, B = 7.0, w = 2.4, h = 1.1, x0 = B - w / 2, x1 = B + w / 2, y0 = 1.75 - h / 2, y1 = 1.75 + h / 2, r = 0.07, g = 0.1, L = w - 2 * (r + g),
        // both bars the same length and dot size; the shorter message just spaces out a little
        bar = (msg, y) => morse(msg, x0 + r + g, y, x1 - r - g, y, { w: L / morseUnits("not crazy").len, color: C.ink, opacity: 0.85 });
      return stacked(A, 0.98, 1.02, { size: 0.265, gap: 0.3 }) + bar("apophenia", y0) + bar("not crazy", y1) +
        [[x0, y0, C.indigo], [x1, y0, C.sky], [x0, y1, C.sky], [x1, y1, C.indigo]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("");
    }
  },
  // Apophenia 16 oz Glass (blank: Fourthwall's 16 oz shaker glass), 9.58×5.04 wrap, front at 50%. The hoodie's back constellation on the front, on its own. The mark + name go round the back,
  // just beside the print seam (which sits at 0%/100%, so nothing straddles it), ~145° from the art.
  ...Object.fromEntries(["white", "ink"].map((v) => [`glass-${v}`, {
    W: 9.58, H: 5.04, bg: v === "white" ? "#1c1917" : "#fff",
    svg: () => {
      const dark = v === "white", cx = 4.79, w = 2.3, top = 1.55, n = hoodieNet(cx - w / 2, top, w, { line: dark ? "#fff" : C.ink, lineOp: dark ? 0.55 : 0.45, lw: 0.014, hub: dark ? "#fff" : C.ink });
      return n.svg +
        lockup(1.15, 4.05, 0.36, { dark, fill: dark ? "none" : "#fff" });  // low, so its mirror image seen through the glass falls below the art
    }
  }])),
  // Apophenia Clear Bottle (blank: Thor Clear Tritan Sports Bottle), 9.46×9.53 wrap, front at 50%. A constellation runs all the way round; through the clear bottle the far side shows
  // behind the near side, so the network re-forms into a new pattern every time you turn it. Mark + name below, front and centre.
  "clear-bottle": {
    W: 9.4567, H: 9.5267, bg: "#e7e5e4",
    svg: () => {
      const W = 9.4567, cx = W / 2, { nodes, edges } = band({ W, y0: 3.6, y1: 5.0, dmin: 0.66, dmax: 1.15, seed: 7, hubAt: cx });
      return drawNet(nodes, edges, { line: C.ink, lineOp: 0.45, lw: 0.016, hub: C.ink, wrapW: W }) + stacked(cx, 5.95, 0.72, { size: 0.235, gap: 0.24 });
    }
  },
  // Apophenia Steel Bottle (blank: H2Go Bolt, black). The 9.09×10.87 template lands as a ~5 in label on the lower body, wrapping only the front half (~186°, front at 50%).
  // A field of random dots, and in it the mark, connected: the pattern found in the noise. Mark + name under it.
  "steel-bottle": {
    W: 9.0867, H: 10.8733, bg: "#18181b",
    svg: () => {
      const W = 9.0867, cx = W / 2, pts = markPts({ cx, cy: 4.7, w: 3.0, h: 3.6, jit: 0.16, seed: 5 });
      return noise({ box: [0.35, 0.3, W - 0.35, 8.2], n: 120, seed: 21, r: 0.2, op: 1.2, pts, clear: 0.28 }) + found({ pts, r: 0.17, lw: 0.075 }) + lockup(cx, 9.45, 0.8, { dark: true, fill: "none" });
    }
  },
  // Apophenia Backpack (blank: All-Over Print Minimalist Backpack), front panel (~12.2×16.1). Random dots over the whole bag; one set of them is connected into the mark. Lockup below.
  "backpack-front": {
    W: 12.2, H: 16.1, bg: C.night,
    svg: () => {
      const pts = markPts({ cx: 6.1, cy: 6.0, w: 3.4, h: 4.0, jit: 0.16, seed: 9 });
      return `<rect width="12.2" height="16.1" fill="${C.night}"/>` + noise({ box: [0, 0, 12.2, 16.1], n: 420, seed: 8, r: 0.17, pts, clear: 0.22, avoid: [[6.1, 12.95, 2.3]] }) +
        found({ pts, r: 0.13, lw: 0.04 }) + lockup(6.1, 12.95, 0.78, { dark: true });
    }
  },
  // Apophenia Duffle Bag (blank: All-Over Print Duffle Bag), long side (22×11.5). The mark in the noise, and one of its diagonals keeps going, out towards the ends of the bag.
  // The extended line is Morse: "not crazy" one way, "apophenia" the other.
  "duffle-front": {
    W: 22, H: 11.5, bg: C.night,
    svg: () => {
      const pts = markPts({ cx: 11.0, cy: 5.75, w: 2.8, h: 3.3, jit: 0.12, seed: 4 }), [, tr, bl, , c] = pts, e1 = onward(c, bl, 22, 11.5, 1.1), e2 = onward(c, tr, 22, 11.5, 1.1),
        seg = ([ax, ay], [bx, by], g = 0.3) => { const L = Math.hypot(bx - ax, by - ay); return [ax + ((bx - ax) * g) / L, ay + ((by - ay) * g) / L, bx - ((bx - ax) * g) / L, by - ((by - ay) * g) / L]; },
        // dots never wider than one Morse unit, so the gaps stay readable
        dash = (msg, a, b) => { const s = seg(a, b); return morse(msg, ...s, { w: Math.min(0.05, Math.hypot(s[2] - s[0], s[3] - s[1]) / morseUnits(msg).len), color: C.url, opacity: 0.8 }); };
      return `<rect width="22" height="11.5" fill="${C.night}"/>` + noise({ box: [0, 0, 22, 11.5], n: 560, seed: 14, r: 0.16, pts, lines: [[bl, e1], [tr, e2]], clear: 0.2, avoid: [[20.2, 10.75, 1.4]] }) +
        dash("not crazy", bl, e1) + dash("apophenia", tr, e2) +
        [e1, e2].map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="0.12" fill="#fff"/>`).join("") + found({ pts, r: 0.12, lw: 0.035 }) + word(21.2, 10.85, 0.34, C.white, "end", `fill-opacity=".8"`);
    }
  },
  // Fill for every other bag panel (top, bottom, back, pocket) in the admin designer: the same night and noise, no mark. 24 in square, scale or crop to fit.
  ...Object.fromEntries([["backpack", 31], ["duffle", 32]].map(([b, seed]) => [`${b}-fill`, { W: 24, H: 24, dpi: 200, bg: C.night, svg: () => `<rect width="24" height="24" fill="${C.night}"/>` + noise({ box: [0, 0, 24, 24], n: 1250, seed, r: 0.17 }) }])),
  // Duffle end panels (11.5×11.5): the mark big, name under it.
  "duffle-end": {
    W: 11.5, H: 11.5, bg: C.night,
    svg: () => `<rect width="11.5" height="11.5" fill="${C.night}"/>` + stacked(5.75, 3.2, 3.6, { dark: true, size: 0.72, gap: 0.8 })
  }
};
