// PATTERN SEEKER 2 — the drawing itself. Runs in a browser canvas, drawn in inches (the context is pre-scaled).
// A jungle in one ink, cut-paper style: the vines are the connections, the nodes are the apophenia.news mark grown wild.

let t;
const rng = (a) => () => ((a = (a + 0x6d2b79f5) | 0), (t = Math.imul(a ^ (a >>> 15), 1 | a)), (t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t), ((t ^ (t >>> 14)) >>> 0) / 4294967296),
  perlin = (R) => {
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) {
      const j = (R() * (i + 1)) | 0;
      [p[i], p[j]] = [p[j], p[i]];
    }
    const P = [...p, ...p], g = (h, x, y) => (h & 1 ? -x : x) + (h & 2 ? -y : y), f = (v) => v * v * v * (v * (v * 6 - 15) + 10), L = (a, b, v) => a + (b - a) * v;
    return (x, y) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      (x -= Math.floor(x)), (y -= Math.floor(y));
      const u = f(x), v = f(y);
      return L(L(g(P[P[X] + Y], x, y), g(P[P[X + 1] + Y], x - 1, y), u), L(g(P[P[X] + Y + 1], x, y - 1), g(P[P[X + 1] + Y + 1], x - 1, y - 1), u), v);
    };
  },
  smooth = (a, b, v) => ((v = Math.min(1, Math.max(0, (v - a) / (b - a)))), v * v * (3 - 2 * v)),
  PI = Math.PI;

// ── geometry helpers
// a spine is a curved centre line: [x, y, heading] samples. at() walks along it, v steps sideways off it.
const spine = (x, y, ang, len, bend = 0, n = 16) => {
    const s = [];
    for (let i = 0; i <= n; i++) {
      const a = ang + bend * (i / n);
      s.push([x, y, a]), (x += (Math.cos(a) * len) / n), (y += (Math.sin(a) * len) / n);
    }
    return s;
  },
  at = (s, u, v = 0) => {
    const f = Math.min(0.9999, Math.max(0, u)) * (s.length - 1), i = f | 0, k = f - i, [x0, y0, a0] = s[i], [x1, y1, a1] = s[i + 1], a = a0 + (a1 - a0) * k;
    return [x0 + (x1 - x0) * k - Math.sin(a) * v, y0 + (y1 - y0) * k + Math.cos(a) * v, a];
  },
  poly = (pts, p = new Path2D()) => (pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))), p.closePath(), p),
  // a blade: the spine fattened by a half-width profile w(u), pointed wherever w hits zero
  blade = (s, w, n = 14, u0 = 0, u1 = 1) => {
    const a = [], b = [];
    for (let i = 0; i <= n; i++) {
      const u = u0 + ((u1 - u0) * i) / n;
      a.push(at(s, u, w(u))), b.unshift(at(s, u, -w(u)));
    }
    return poly([...a, ...b]);
  };

function jungle(ctx, { W = 15, seed = 11, ink = "#f1ecdf", accents = null, wall = false, mark = false }) {
  const R = rng(seed), rr = (a, b) => a + (b - a) * R(), pick = (a) => a[(R() * a.length) | 0], noise = perlin(R), GAP = 0.036, MOAT = wall ? 0.15 : GAP, VINE = wall ? 0.16 : 0.135,
    // every shape first clears a thin moat around itself, so stacked leaves stay readable in a single ink
    put = (path, gap = GAP, fill = ink) => {
      (ctx.globalCompositeOperation = "destination-out"), (ctx.lineWidth = gap * 2), (ctx.lineJoin = "round"), ctx.stroke(path), ctx.fill(path);
      (ctx.globalCompositeOperation = "source-over"), (ctx.fillStyle = fill), ctx.fill(path);
    },
    cut = (path) => ((ctx.globalCompositeOperation = "destination-out"), ctx.fill(path), (ctx.globalCompositeOperation = "source-over")),
    line = (pts, w, gap = GAP, color = ink) => {
      const p = new Path2D();
      pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
      (ctx.lineCap = ctx.lineJoin = "round"), (ctx.globalCompositeOperation = "destination-out"), (ctx.lineWidth = w + gap * 2), ctx.stroke(p);
      (ctx.globalCompositeOperation = "source-over"), (ctx.strokeStyle = color), (ctx.lineWidth = w), ctx.stroke(p);
    },
    // ── plants
    frond = (x, y, ang, len, bend, dens = 6.2) => {
      const s = spine(x, y, ang, len, bend, 26), p = new Path2D(), n = Math.round(len * dens);
      p.addPath(blade(s, (u) => 0.04 * (1 - u) + 0.008, 20));
      for (let i = 0; i < n; i++)
        for (const side of [1, -1]) {
          const u = 0.08 + (0.92 * (i + (side > 0 ? 0.15 : 0.6))) / n, [px, py, a] = at(s, u), l = len * 0.36 * Math.sin(PI * u ** 0.72) ** 0.75 + 0.08;
          p.addPath(blade(spine(px, py, a + side * (1.3 - 0.85 * u), l, side * -0.3, 6), (v) => l * 0.068 * Math.sin(PI * v ** 0.55) ** 0.9, 6));
        }
      put(p);
    },
    banana = (x, y, ang, len, bend, wm = len * 0.17) => {
      const s = spine(x, y, ang, len, bend, 30), w = (u) => wm * Math.sin(PI * u ** 0.8) ** 0.55;
      put(blade(s, (u) => (u < 0.03 ? 0.03 : w(u)), 34));
      for (const side of [1, -1])
        for (let k = 0, n = 4 + ((R() * 4) | 0); k < n; k++) {
          const u = 0.16 + (0.72 * (k + rr(0.2, 0.8))) / n, d = 0.011;
          cut(poly([at(s, u - d, side * w(u) * 1.12), at(s, u + d, side * w(u) * 1.12), at(s, u + 0.035, side * w(u) * 0.2)]));
        }
      cut(blade(s, (u) => 0.02 * (1 - u) + 0.006, 20, 0.03, 0.94));
    },
    monstera = (x, y, ang, L) => {
      const M = ([u, v]) => [x + L * (u * Math.cos(ang) - v * Math.sin(ang)), y + L * (u * Math.sin(ang) + v * Math.cos(ang))],
        half = [[0, 0], [-0.1, 0.13], [-0.07, 0.33], [0.15, 0.49], [0.45, 0.46], [0.74, 0.3], [0.93, 0.11], [1, 0]],
        ctrl = [...half, ...half.slice(1, -1).reverse().map(([u, v]) => [u, -v])], out = [];
      for (let i = 0; i < ctrl.length; i++) {
        const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((k) => ctrl[(i + k + ctrl.length) % ctrl.length]);
        for (let k = 0; k < 8; k++) {
          const q = k / 8, c = (a, b, c2, d) => 0.5 * (2 * b + (c2 - a) * q + (2 * a - 5 * b + 4 * c2 - d) * q * q + (3 * b - a - 3 * c2 + d) * q * q * q);
          out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
        }
      }
      put(poly(out.map(M)));
      for (const side of [1, -1]) {
        for (const ue of [0.2, 0.38, 0.56, 0.73].map((u) => u + rr(-0.03, 0.03))) {
          const [, ve] = out.filter((p) => p[1] * side > 0.05).reduce((b, p) => (Math.abs(p[0] - ue) < Math.abs(b[0] - ue) ? p : b)), d = 0.034;
          cut(poly([[ue - d, ve * 1.1], [ue + d, ve * 1.1], [ue - 0.085, ve * 0.3 + 0.012 * side], [ue - 0.105, ve * 0.3]].map(M)));
        }
        for (const [u, v] of [[0.3, 0.15], [0.48, 0.135], [0.65, 0.1]]) {
          const [hx, hy] = M([u + rr(-0.02, 0.02), v * side]);
          (ctx.globalCompositeOperation = "destination-out"), ctx.beginPath(), ctx.ellipse(hx, hy, L * 0.05, L * 0.019, ang + side * 1.0, 0, 7), ctx.fill();
        }
      }
      cut(poly([[0.03, 0.013], [0.9, 0.003], [0.9, -0.003], [0.03, -0.013]].map(M)));
      ctx.globalCompositeOperation = "source-over";
    },
    fan = (x, y, ang, r, n = 15, spread = 3.7) => {
      const p = new Path2D();
      for (let i = 0; i < n; i++) {
        const l = r * rr(0.84, 1);
        p.addPath(blade(spine(x, y, ang + (i / (n - 1) - 0.5) * spread, l, 0, 5), (u) => r * 0.088 * Math.sin(PI * u ** 0.42) ** 1.15, 8));
      }
      put(p);
      for (let i = 0; i < n - 1; i++) {
        const a = ang + ((i + 0.5) / (n - 1) - 0.5) * spread;
        cut(blade(spine(x + Math.cos(a) * r * 0.16, y + Math.sin(a) * r * 0.16, a, r * 0.42, 0, 3), (u) => 0.011 * (1 - u) + 0.004, 4));
      }
    },
    leaf = (x, y, ang, l, bend = 0, fat = 0.2, gap = 0.028) => put(blade(spine(x, y, ang, l, bend, 8), (u) => l * fat * Math.sin(PI * u ** 0.68) ** 0.85, 10), gap),
    stem = (x0, y0, x1, y1, w = 0.05) => {
      const mx = (x0 + x1) / 2 + (y1 - y0) * 0.18, my = (y0 + y1) / 2;
      line([...Array(13)].map((_, i) => ((i /= 12), [(1 - i) ** 2 * x0 + 2 * i * (1 - i) * mx + i * i * x1, (1 - i) ** 2 * y0 + 2 * i * (1 - i) * my + i * i * y1])), w);
    },
    // ── the connections: the logo's four nodes and hub, with the network growing on out to both sides
    cx = W / 2, j = () => rr(-0.13, 0.13),
    N = {
      hub: [cx, 3.75, 0.62],
      tl: [cx - 2.05 + j(), 2.05 + j(), 0.4], tr: [cx + 2.05 + j(), 2.05 + j(), 0.4],
      bl: [cx - 2.05 + j(), 5.4 + j(), 0.4], br: [cx + 2.05 + j(), 5.4 + j(), 0.4],
      l1: [cx - 4.3 + j(), 3.5 + j(), 0.33], r1: [cx + 4.3 + j(), 3.5 + j(), 0.33],
      l2: [cx - 6.05 + j(), 5.0 + j(), 0.26], r2: [cx + 6.05 + j(), 5.0 + j(), 0.26],
      l0: [cx - 5.5 + j(), 1.75 + j(), 0.22], r0: [cx + 5.5 + j(), 1.75 + j(), 0.22]
    },
    LINKS = [["hub", "tl"], ["hub", "tr"], ["hub", "bl"], ["hub", "br"], ["tl", "tr", 0.55], ["bl", "br", 0.5], ["tl", "l1", 0.3], ["bl", "l1", 0.25], ["l1", "l2", 0.3],
      ["tr", "r1", 0.3], ["br", "r1", 0.25], ["r1", "r2", 0.3], ["l0", "l1", 0.2], ["l0", "tl", 0.35], ["r0", "r1", 0.2], ["r0", "tr", 0.35]],
    clear = (x, y, pad = 0.2) => Object.values(N).every(([a, b, r]) => Math.hypot(x - a, y - b) > r + pad),
    vine = ([x0, y0], [x1, y1], sag = 0.12, w = VINE) => {
      const len = Math.hypot(x1 - x0, y1 - y0), mx = (x0 + x1) / 2 + rr(-0.1, 0.1) * len, my = (y0 + y1) / 2 + sag * len,
        B = (i) => [(1 - i) ** 2 * x0 + 2 * i * (1 - i) * mx + i * i * x1, (1 - i) ** 2 * y0 + 2 * i * (1 - i) * my + i * i * y1],
        pts = [...Array(33)].map((_, i) => B(i / 32));
      line(pts, w, MOAT);
      for (let d = 0.42, side = pick([1, -1]); !wall && d < len - 0.3; d += rr(0.36, 0.6), side = -side) {
        const [x, y] = B(d / len), [x2, y2] = B(d / len + 0.01), a = Math.atan2(y2 - y, x2 - x);
        clear(x, y, 0.3) && leaf(x, y, a + side * rr(0.7, 1.15), rr(0.36, 0.58), side * -0.5, 0.22, MOAT * 0.7);
      }
      // a few loose tendrils hanging off the long, sagging ones
      for (let k = 0; !wall && !mark && sag > 0.2 && k < len * 0.9; k++) {
        const [x, y] = B(rr(0.2, 0.8)), l = rr(0.35, 1.25), sway = rr(-0.18, 0.18);
        if (!clear(x, y + l, 0.25)) continue;
        line([...Array(9)].map((_, i) => [x + Math.sin((i / 8) * 2.4) * sway, y + (i / 8) * l]), 0.036, wall ? 0.06 : 0.028);
        leaf(x + Math.sin(2.4) * sway, y + l - 0.04, PI / 2 + rr(-0.5, 0.5), rr(0.18, 0.26), 0, 0.3, wall ? 0.06 : 0.028);
      }
    },
    node = ([x, y, r], color = ink) => {
      (ctx.globalCompositeOperation = "destination-out"), ctx.beginPath(), ctx.arc(x, y, r * 1.13 + MOAT * 1.6 + 0.03, 0, 7), ctx.fill();
      (ctx.globalCompositeOperation = "source-over"), (ctx.strokeStyle = ctx.fillStyle = color), (ctx.lineWidth = r * 0.26);
      ctx.beginPath(), ctx.arc(x, y, r, 0, 7), ctx.stroke(), ctx.beginPath(), ctx.arc(x, y, r * 0.48, 0, 7), ctx.fill();
    },
    // ── the jungle floor: tall at the edges, parting in the middle where the mark sits
    top = (x) => 6.75 - 2.0 * Math.abs((x - cx) / cx) ** 1.6, floor = 9.1;

  // the wall: a mound of foliage rising behind the whole network, far rows first so nearer plants overlap them
  const peak = (x) => 0.75 + 3.9 * Math.abs((x - cx) / cx) ** 1.3;
  for (let y = 0.9; wall && y < floor - 2.1; y += 0.5)
    for (let x = 0.4 + rr(0, 0.6); x < W - 0.3; x += rr(0.95, 1.5)) {
      if (y < peak(x) + rr(0, 0.45)) continue;
      const out = (x - cx) / cx, a = -PI / 2 + out * 0.65 + rr(-0.6, 0.6), k = R();
      k < 0.46 ? monstera(x, y + 0.9, a, rr(1.4, 2.1)) : k < 0.8 ? banana(x, y + 1.7, a, rr(2, 2.9), rr(-0.4, 0.4))
        : k < 0.92 ? frond(x, y + 1.5, a, rr(1.7, 2.5), rr(-0.8, 0.8)) : fan(x, y + 0.9, a, rr(1, 1.4));
    }
  if (mark) {
    for (const [a, b, sag = 0.06] of LINKS.slice(0, 6)) vine(N[a], N[b], sag * 0.5);
    for (const k of ["hub", "tl", "tr", "bl", "br"]) node(N[k]);
    return { noise, floor };
  }
  // back row: tall fronds and banana leaves
  for (let x = 0.5; x < W - 0.3; x += rr(0.5, 0.95)) {
    const out = (x - cx) / cx, h = floor - top(x);
    R() < 0.3 ? banana(x, floor - 0.2, -PI / 2 + out * 0.35 + rr(-0.2, 0.2), h * rr(0.85, 1.05), out * 0.5 + rr(-0.25, 0.25))
      : frond(x, floor - 0.1, -PI / 2 + out * 0.3 + rr(-0.3, 0.3), h * rr(0.95, 1.2), (out + rr(-0.5, 0.5)) * 0.9);
  }
  // middle row: monstera and fan palms on stems
  for (let x = 0.7; x < W - 0.5; x += rr(0.85, 1.45)) {
    const out = (x - cx) / cx, y = top(x) + rr(0.75, 1.5), a = -PI / 2 + out * 0.5 + rr(-0.55, 0.55);
    stem(x + rr(-0.3, 0.3), floor, x, y);
    R() < 0.62 ? monstera(x, y, a, rr(1.25, 1.9)) : fan(x, y + 0.3, a, rr(0.95, 1.35));
  }
  // the network, rooted in the floor
  for (const k of wall ? [] : ["bl", "br", "l2", "r2", "l1", "r1"]) vine([N[k][0] + rr(-0.5, 0.5), floor - 0.4], N[k], 0);
  for (const [a, b, sag = 0.06] of LINKS) vine(N[a], N[b], sag);
  for (const [k, n] of Object.entries(N)) node(n, accents ? (k === "hub" ? ink : accents[(k.charCodeAt(0) + k.charCodeAt(1)) % 2]) : ink);
  // front row: low fronds, small monstera, ground leaves
  for (let x = 0.3; x < W - 0.2; x += rr(0.38, 0.7)) {
    const out = (x - cx) / cx, k = R();
    k < 0.5 ? frond(x, floor + 0.15, -PI / 2 + out * 0.5 + rr(-0.7, 0.7), rr(1.5, 2.3), rr(-0.9, 0.9), 7)
      : k < 0.78 ? monstera(x, floor - rr(0.5, 1.1), -PI / 2 + rr(-0.8, 0.8), rr(0.85, 1.25))
      : fan(x, floor - 0.2, -PI / 2 + rr(-0.4, 0.4), rr(0.8, 1.1), 11, 3.2);
  }
  return { noise, floor };
}

// The fade: hard-edged dry-brush break-up toward the bottom and sides (print-safe — no soft transparency), plus light wear all over.
function fade(ctx, S, { W, y0 = 7.35, y1 = 9.15, side = 1.6, wear = 0.018 }, noise) {
  const c = ctx.canvas, img = ctx.getImageData(0, 0, c.width, c.height), d = img.data, n01 = (x, y) => Math.min(1, Math.max(0, 0.5 + noise(x, y) * 0.95));
  for (let py = 0; py < c.height; py++)
    for (let px = 0; px < c.width; px++) {
      const i = (py * c.width + px) * 4 + 3;
      if (!d[i]) continue;
      const x = px / S, y = py / S, kb = 1 - smooth(y0, y1, y), ks = side > 0 ? Math.min(smooth(0.05, side, x), smooth(0.05, side, W - x)) : 1,
        grain = n01(x * 23, y * 23) * 0.3;
      if (
        (kb < 1 && n01(x * 4.2, y * 0.75 + 7) * 0.7 + grain > kb * 1.02) ||
        (ks < 1 && n01(x * 0.8 + 31, y * 4.6) * 0.7 + grain > ks * 1.02) ||
        (n01(x * 34 + 3, y * 34) > 1 - wear * 2 && n01(x * 1.3 + 60, y * 1.3) > 0.5)
      )
        d[i] = 0;
    }
  ctx.putImageData(img, 0, 0);
}
