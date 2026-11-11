// Renders an SVG drawn in inches to a PNG through headless Chromium, with the site fonts embedded.
// render({ svg, W, H, dpi, out, bg }) → out. Elements with data-cx / data-cy get re-centred on that point once fonts are in (for text lockups).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const nm = new URL("../node_modules/", import.meta.url).pathname,
  b64 = (f) => fs.readFileSync(nm + f).toString("base64"),
  FONTS = `@font-face{font-family:GSF;src:url(data:font/woff2;base64,${b64("@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-wght-normal.woff2")});font-weight:100 900}
@font-face{font-family:SG;src:url(data:font/woff2;base64,${b64("@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2")});font-weight:300 700}`,
  chrome = fs.globSync(`${os.homedir()}/.cache/ms-playwright/chromium_headless_shell-*/*/chrome-headless-shell`)[0] || "/opt/pw-browsers/chromium";

// screenshots an HTML string at w×h (clear = transparent wherever the page paints nothing)
export const shoot = (html, w, h, out, clear = false) => {
  const f = `${out}.html`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(f, html.replace("<style>", `<style>${FONTS}`));
  execFileSync(chrome, ["--headless", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=30000", "--timeout=120000",
    ...(clear ? ["--default-background-color=00000000"] : []), `--window-size=${w},${h}`, `--screenshot=${path.resolve(out)}`, `file://${path.resolve(f)}`], { stdio: "ignore" });
  fs.rmSync(f);
  return out;
};

export const render = ({ svg, W, H, dpi = 300, out, bg = "transparent" }) => {
  const w = Math.round(W * dpi), h = Math.round(H * dpi), html = `${out}.html`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(html, `<!doctype html><style>${FONTS}html,body{margin:0;background:${bg}}svg{display:block}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${W} ${H}">${svg}</svg>
<script>document.fonts.ready.then(() => document.querySelectorAll("[data-cx],[data-cy]").forEach((e) => {
  const b = e.getBBox(), cx = e.dataset.cx, cy = e.dataset.cy;
  e.setAttribute("transform", \`translate(\${cx ? cx - b.x - b.width / 2 : 0} \${cy ? cy - b.y - b.height / 2 : 0}) \${e.getAttribute("transform") || ""}\`);
}));</script>`);
  execFileSync(chrome, ["--headless", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=30000", "--timeout=120000",
    "--default-background-color=00000000", `--window-size=${w},${h}`, `--screenshot=${path.resolve(out)}`, `file://${path.resolve(html)}`], { stdio: "ignore" });
  fs.rmSync(html);
  return out;
};
