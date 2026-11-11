// usage: node build.mjs [name ...] [--print]
//   default → art/<product>/<name>-preview.png at 100 dpi on the product colour, to look at
//   --print → art/<product>/<name>.png at 300 dpi, transparent where nothing prints (the files Fourthwall gets)
// <product> is the name up to the first dash: pint-ink → art/pint/
import { pieces } from "./designs.mjs";
import { render } from "./render.mjs";

const args = process.argv.slice(2), print = args.includes("--print"), names = args.filter((a) => !a.startsWith("--"));
for (const n of names.length ? names : Object.keys(pieces)) {
  const { W, H, bg, svg } = pieces[n];
  console.log(render({ svg: svg(), W, H, dpi: print ? 300 : 100, bg: print ? "transparent" : bg, out: new URL(`../art/${n.split("-")[0]}/${n}${print ? "" : "-preview"}.png`, import.meta.url).pathname }));
}
