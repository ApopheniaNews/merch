// Calibration grids for each drinkware print area: inch grid, and the 0/25/50/75/100% columns labelled, to see where Fourthwall wraps the art.
// usage: node src/calib.mjs → .calib/calib-<name>.png (scratch, not committed); push one through fw.mjs preview to see the wrap
import { render } from "./render.mjs";

export const AREAS = { mug: [9, 3.5], pint: [9.58, 5.04], "clear-bottle": [9.4567, 9.5267], "steel-bottle": [9.0867, 10.8733] };
for (const [name, [W, H]] of Object.entries(AREAS)) {
  let s = `<rect width="${W}" height="${H}" fill="#fff"/>`;
  for (let x = 0; x <= W; x += 0.5) s += `<line x1="${x}" x2="${x}" y2="${H}" stroke="${x % 1 ? "#ccc" : "#888"}" stroke-width="0.015"/>`;
  for (let y = 0; y <= H; y += 0.5) s += `<line y1="${y}" y2="${y}" x2="${W}" stroke="${y % 1 ? "#ccc" : "#888"}" stroke-width="0.015"/><text x="0.08" y="${y - 0.05}" font-family="SG" font-size="0.22" fill="#444">${y}</text>`;
  ["#e11d48", "#f59e0b", "#16a34a", "#2563eb", "#9333ea"].forEach((c, i) => {
    const x = (W * i) / 4;
    s += `<rect x="${x - 0.12}" width="0.24" height="${H}" fill="${c}" opacity=".85"/><text x="${Math.min(W - 0.9, Math.max(0.3, x + 0.18))}" y="${H / 2}" font-family="SG" font-weight="700" font-size="0.45" fill="${c}">${i * 25}%</text>`;
  });
  s += `<text x="${W / 2}" y="${H * 0.25 + 0.2}" text-anchor="middle" font-family="SG" font-weight="700" font-size="0.5" fill="#111">TOP ${name}</text>`;
  console.log(render({ svg: s, W, H, dpi: 150, out: new URL(`../.calib/calib-${name}.png`, import.meta.url).pathname }));
}
