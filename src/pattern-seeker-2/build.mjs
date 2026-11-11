// PATTERN SEEKER 2 — renders the canvas art through headless Chromium.
// usage: node src/pattern-seeker-2/build.mjs <back|wall|back-color|chest> [--print] → art/pattern-seeker-2/<name>-preview.png (dark bg, 100 dpi) or <name>.png (transparent, 300 dpi)
import fs from "node:fs";
import os from "node:os";
import { execFileSync } from "node:child_process";

const here = new URL(".", import.meta.url).pathname,
  font = fs.readFileSync(`${here}../../node_modules/@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-wght-normal.woff2`).toString("base64"),
  chrome = fs.globSync(`${os.homedir()}/.cache/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell`)[0] || "/opt/pw-browsers/chromium",
  [name = "back", flag] = process.argv.slice(2),
  print = flag === "--print",
  S = print || name === "chest" ? 300 : 100,
  INK = "#f1ecdf",
  // each piece: canvas size in inches + the drawing calls (ctx is scaled to inches)
  back = (opts) => `const { noise } = jungle(ctx, { W: 15, ${opts} }); ctx.resetTransform(); fade(ctx, S, { W: 15 }, noise); wordmark(7.5, 9.95, 0.42);`,
  pieces = {
    back: { W: 15, H: 10.3, draw: back(`ink: "${INK}"`) },
    wall: { W: 15, H: 10.3, draw: back(`ink: "${INK}", wall: true`) },
    "back-color": { W: 15, H: 10.3, draw: back(`ink: "${INK}", accents: ["#6366f1", "#38bdf8"]`) },
    // left chest: the five-node mark on its vines, 2.9 in wide, name underneath
    chest: { W: 3, H: 3.5, draw: `ctx.save(); ctx.translate(1.5 - 7.5 * 0.54, 0.22 - 1.5 * 0.54); ctx.scale(0.54, 0.54); const { noise } = jungle(ctx, { W: 15, ink: "${INK}", mark: true }); ctx.restore(); ctx.resetTransform(); fade(ctx, S, { W: 3, y0: 90, y1: 91, side: 0, wear: 0.008 }, noise); wordmark(1.5, 3.3, 0.31);` }
  },
  { W, H, draw } = pieces[name],
  html = `${here}../../art/pattern-seeker-2/${name}.html`,
  png = `${here}../../art/pattern-seeker-2/${name}${print ? "" : "-preview"}.png`;

fs.writeFileSync(
  html,
  `<!doctype html><style>html,body{margin:0;background:${print ? "transparent" : "#111"}}canvas{display:block}</style>
<canvas width="${W * S}" height="${H * S}"></canvas><script>${fs.readFileSync(`${here}art.js`)}
const S = ${S}, ctx = document.querySelector("canvas").getContext("2d", { willReadFrequently: true }),
  wordmark = (x, y, size, align = "center") => {
    ctx.textAlign = align, ctx.font = \`600 \${size * S}px GSF\`, ctx.fillStyle = "${INK}", ctx.fillText("apophenia.news", x * S, y * S);
  };
new FontFace("GSF", "url(data:font/woff2;base64,${font})", { weight: "100 900" }).load().then((f) => { document.fonts.add(f); ctx.scale(S, S); ${draw} });
</script>`
);
execFileSync(chrome, [
  "--headless", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=120000", "--timeout=180000",
  "--default-background-color=00000000", `--window-size=${W * S},${H * S}`, `--screenshot=${png}`, `file://${html}`
], { stdio: "ignore" });
fs.rmSync(html);
console.log(png, `${W * S}×${H * S}`);
