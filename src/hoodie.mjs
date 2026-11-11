// PATTERN SEEKER, the zip hoodie in the store (blank: Gildan Heavy Blend full-zip hoodie). Ported unchanged from the old in-browser generator (dark = black / sport grey garment).
// usage: node src/hoodie.mjs → art/hoodie/{front,back}.svg (fonts embedded, standalone) + .png at 300 dpi, transparent
//   front: left chest, 4.00 × 1.13 in, mark + wordmark. back: centre, 11.00 × 7.00 in, constellation + tagline.
// Fourthwall: Printed → DTFx. Front 4 in wide, top edge ~3 in below the collar seam; back 11 in wide, top edge ~4 in below it.
// The open ring in the back constellation is intentional — don't "fix" it.
import fs from "node:fs";
import { shoot } from "./render.mjs";

const here = new URL(".", import.meta.url).pathname, out = `${here}../art/hoodie/`,
  font = fs.readFileSync(`${here}../node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2`).toString("base64"),
  ART = { front: { w: 1200, h: 340 }, back: { w: 3300, h: 2100 } },
  // [x, y, r, colour] — 0 indigo, 1 cyan, 2 core, 3 the open ring
  NODES = [[430, 380, 30, 0], [1080, 210, 24, 1], [1760, 330, 30, 0], [2480, 250, 26, 3], [2890, 720, 30, 0], [2200, 900, 36, 1], [1500, 760, 46, 2], [830, 940, 30, 1],
    [400, 1180, 24, 0], [1980, 1300, 30, 0], [1180, 1320, 26, 1], [2760, 1230, 22, 1]],
  EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0], [1, 6], [2, 6], [6, 9], [9, 5], [7, 10], [10, 6], [10, 9], [4, 11], [11, 9], [0, 7]],
  P = { indigo: "#4f46e5", cyan: "#0ea5e9" },
  theme = (v) => (v === "dark" ? { ink: "#ffffff", edge: "#ffffff", edgeOpacity: ".30", word: "#ffffff", sub: "#8ab4f8" } : { ink: "#15151b", edge: "#15151b", edgeOpacity: ".32", word: "#15151b", sub: "#4f46e5" }),
  wrap = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="ap-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${P.indigo}"/><stop offset="100%" stop-color="${P.cyan}"/></linearGradient>
<style>@font-face{font-family:'Space Grotesk';font-weight:300 700;src:url(data:font/woff2;base64,${font}) format('woff2')}</style></defs>
${body}
</svg>`,
  mark = (t) => `<g><rect x="6" y="6" width="108" height="108" rx="28" fill="none" stroke="url(#ap-grad)" stroke-width="8"/>
<path d="M36 36L84 84M84 36L36 84M36 36H84M36 84H84" stroke="${t.ink}" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>
<circle cx="36" cy="36" r="8" fill="${P.indigo}"/><circle cx="84" cy="36" r="8" fill="${P.cyan}"/><circle cx="36" cy="84" r="8" fill="${P.cyan}"/><circle cx="84" cy="84" r="8" fill="${P.indigo}"/><circle cx="60" cy="60" r="10" fill="${t.ink}"/></g>`,
  constellation = (t) =>
    EDGES.map(([a, b]) => `<line x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}" stroke="${t.edge}" stroke-opacity="${t.edgeOpacity}" stroke-width="7" stroke-linecap="round"/>`).join("") +
    NODES.map(([x, y, r, c]) =>
      c === 3 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="url(#ap-grad)" stroke-width="11"/>`
        : c === 2 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="${t.ink}"/><circle cx="${x}" cy="${y}" r="${r + 22}" fill="none" stroke="${t.edge}" stroke-opacity=".22" stroke-width="6"/>`
        : `<circle cx="${x}" cy="${y}" r="${r}" fill="${c ? P.cyan : P.indigo}"/>`).join(""),
  BUILD = {
    front: (t) => `<g transform="translate(14 42) scale(2.1667)">${mark(t)}</g>
<text x="312" y="212" font-family="Space Grotesk" font-weight="700" font-size="112" fill="${t.word}" textLength="862" lengthAdjust="spacing">apophenia.news</text>`,
    back: (t) => `${constellation(t)}
<text x="1650" y="1770" text-anchor="middle" font-family="Space Grotesk" font-weight="500" font-size="180" fill="${t.word}" textLength="2800" lengthAdjust="spacing">finding patterns in the noise</text>
<text x="1650" y="1990" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="88" fill="${t.sub}" textLength="780" lengthAdjust="spacing">apophenia.news</text>`
  };

fs.mkdirSync(out, { recursive: true });
for (const [k, { w, h }] of Object.entries(ART)) {
  const svg = wrap(w, h, BUILD[k](theme("dark")));
  fs.writeFileSync(`${out}${k}.svg`, svg);
  // transparent PNG: the SVG as the whole page, no background
  console.log(shoot(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`, w, h, `${out}${k}.png`, true));
}
