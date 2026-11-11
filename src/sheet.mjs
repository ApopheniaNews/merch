// Approval boards: one per product (art/<product>/board.png) and all six on one sheet (art/approval-sheet.png).
import { shoot } from "./render.mjs";

const here = new URL(".", import.meta.url).pathname, u = (p) => `file://${here}${p}`,
  // pane: an image cropped/zoomed into a fixed box. z = zoom, ox/oy = focus point in %
  pane = ({ src, z = 1, ox = 50, oy = 50, bg = "#ececee", w = 560, h = 760, cap = "" }) =>
    `<figure style="margin:0"><div style="width:${w}px;height:${h}px;overflow:hidden;border-radius:18px;background:${bg};position:relative">
<img src="${u(src)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${ox}% ${oy}%;transform:scale(${z});transform-origin:${ox}% ${oy}%"></div>
${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`,
  flat = (src, bg, h = 300) => `<div class="flat" style="background:${bg};height:${h}px"><img src="${u(src)}"></div>`,
  CSS = `<style>*{box-sizing:border-box}body{margin:0;background:#f6f6f4;font-family:SG;color:#18181b}
.b{width:1800px;height:900px;padding:44px;display:grid;grid-template-columns:560px 560px 1fr;align-items:start;gap:28px;background:#f6f6f4}
h2{font:700 40px/1.1 GSF;margin:0 0 4px;letter-spacing:-.01em}.spec{font-size:19px;color:#71717a;margin:0 0 20px}
p{font-size:22px;line-height:1.42;margin:0 0 14px;color:#3f3f46}.egg{border-left:4px solid #4f46e5;padding:4px 0 4px 16px;color:#27272a}
.egg b{color:#4f46e5;font-weight:600}.note{font-size:18px;color:#71717a}figcaption{font-size:17px;color:#71717a;margin-top:8px}
.flat{border-radius:14px;display:flex;align-items:center;justify-content:center;padding:14px;margin-top:6px}.flat img{max-width:100%;max-height:100%;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
.lab{font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#a1a1aa;margin:18px 0 0}</style>`,
  boards = {
    mug: {
      t: "White Glossy Mug", s: "Sublimation · 11 / 15 / 20 oz · Fourthwall render",
      a: pane({ src: "../art/mug/render-1.webp", z: 1.55, oy: 47, cap: "Handle left: the mark and the name" }),
      b: pane({ src: "../art/mug/render-2.webp", z: 1.55, oy: 47, cap: "Handle right: the mark's skeleton, nothing between" }),
      body: `<p>One side is the mark and the name, nothing else. The other is the mark's skeleton pulled wide: its four dots and its top and bottom bars, with nothing between them.</p>
<p class="egg"><b>Hidden:</b> both bars are Morse code for <b>not crazy</b>.</p>`,
      flat: flat("../art/mug/mug-preview.png", "#fff", 250)
    },
    pint: {
      t: "Shaker Pint Glass", s: "UV print on clear glass · 16 oz · Fourthwall render",
      a: pane({ src: "../art/pint/render-1.webp", z: 1.3, oy: 40, bg: "#fff", cap: "Front: the constellation" }),
      b: pane({ src: "../art/pint/render-2.webp", z: 1.3, ox: 35, oy: 48, bg: "#fff", cap: "Turned: the mark and the name round the back" }),
      body: `<p>The hoodie's back constellation, on its own, on the front of the glass.</p>
<p>The mark and name sit round the back, about 145° from the art. Fourthwall's print seam is at the exact back, so the name sits just beside it rather than across it.</p>
<p class="note">On clear glass you'll always see the back through the front, mirrored. The name sits low so that ghost falls under the art, not on it.</p>`,
      flat: flat("../art/pint/pint-ink-preview.png", "#fff", 250)
    },
    thor: {
      t: "Thor Clear Tritan Bottle", s: "UV print on clear Tritan · 27 oz · Fourthwall render",
      a: pane({ src: "../art/thor/render-1.webp", z: 1.45, oy: 52, cap: "Front" }),
      b: pane({ src: "../art/thor/render-2.webp", z: 1.3, oy: 50, cap: "From above: the far side shows through" }),
      body: `<p>A thin network runs all the way round. Because the bottle is clear, the far side shows through behind the near side, so the network forms a new pattern every time you turn it. The mark and name sit centred under it.</p>
<p class="egg"><b>The idea:</b> the dots never change, only your angle does.</p>`,
      flat: flat("../art/thor/thor-preview.png", "#e7e5e4", 300)
    },
    h2go: {
      t: "H2Go Bolt, Black", s: "UV print on stainless steel · 24 oz · Fourthwall render",
      a: pane({ src: "../art/h2go/render-1.webp", z: 1.5, oy: 72, bg: "#d4d4d8", cap: "Front" }),
      b: pane({ src: "../art/h2go/render-2.webp", z: 1.4, oy: 74, bg: "#d4d4d8", cap: "From above" }),
      body: `<p>A field of random dots, and in it a few of them connected into the mark: the pattern found in the noise. The mark and name sit under it.</p>
<p class="note">The dots are generated, not taken from anything real, and the found mark is drawn a little loose so it looks found rather than stamped.</p>`,
      flat: flat("../art/h2go/h2go-preview.png", "#18181b", 330)
    },
    backpack: {
      t: "Minimalist Backpack", s: "All-over print · 16 × 12 × 5.5 in · my composite",
      a: pane({ src: "../art/backpack/mockup.jpg", z: 1.18, oy: 50, cap: "Front" }),
      b: pane({ src: "../art/backpack/backpack-front-preview.png", z: 1, bg: "#0b0d17", cap: "Front panel, flat" }),
      body: `<p>Random dots over the whole bag. One set of them is connected, and it's the mark. The lockup sits low on the front, the way the hoodie carries it on the chest.</p>
<p class="note">Fourthwall can't render all-over-print bags through the API, so this mockup is my own composite on their blank photo. It's close, but not exact.</p>`,
      flat: ""
    },
    duffle: {
      t: "Duffle Bag", s: "All-over print · 22 × 11.5 × 11.5 in · my composite",
      a: pane({ src: "../art/duffle/mockup.jpg", z: 1.25, ox: 52, oy: 50, cap: "End panel facing, long side going back" }),
      b: pane({ src: "../art/duffle/duffle-end-preview.png", z: 1, bg: "#0b0d17", h: 560, cap: "End panels, flat" }),
      body: `<p>The end panels carry the mark, big, with the name. The long sides have the mark in the noise, with one of its diagonals carried on toward the ends of the bag.</p>
<p class="egg"><b>Hidden:</b> that line is Morse. One way it says <b>go far</b>, the other way <b>go home</b>. Fitting for a travel bag.</p>`,
      flat: `<div class="lab">Long side, flat</div>` + flat("../art/duffle/duffle-front-preview.png", "#0b0d17", 330)
    }
  };

const board = (k) => { const b = boards[k]; return `<div class="b">${b.a}${b.b}<div><h2>${b.t}</h2><div class="spec">${b.s}</div>${b.body}${b.flat ? (b.flat.startsWith("<div class=\"lab") ? b.flat : `<div class="lab">Print file</div>${b.flat}`) : ""}</div></div>`; };
for (const k of Object.keys(boards)) console.log(shoot(`<!doctype html>${CSS}${board(k)}`, 1800, 900, `${here}../art/${k}/board.png`));
// overview: header + the six boards at half size, two across
const keys = Object.keys(boards);
console.log(shoot(`<!doctype html>${CSS}<style>.g{display:grid;grid-template-columns:repeat(2,900px);gap:0;padding:0 0 30px}.g>div{width:900px;height:450px;overflow:hidden}.g .b{transform:scale(.5);transform-origin:0 0}</style>
<div style="padding:46px 44px 26px"><div style="font:700 50px GSF;letter-spacing:-.01em">apophenia.news goods, for approval</div>
<div style="font-size:23px;color:#52525b;margin-top:10px;line-height:1.4">The mark and the name are the core on every piece, like the hoodie, plus one small idea that fits each object.<br>Mug, glass and bottles are Fourthwall's own renders of the real print files. The bags are my composites. Nothing is published or listed.</div></div>
<div class="g">${keys.map((k) => `<div>${board(k)}</div>`).join("")}</div>`, 1800, 190 + 450 * 3 + 30, `${here}../art/approval-sheet.png`));
