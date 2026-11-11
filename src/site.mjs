// The GitHub Pages site: every merch design on one page, built from the catalog below.
// usage: node src/site.mjs → index.html. To add a design: put its files in art/<id>/ and add an entry here.
import fs from "node:fs";

const STORE = "https://store.apophenia.news",
  STATUS = { live: "In the store", approved: "Approved, not in the store yet" },
  // img: [file, caption, background behind transparent files]; files: [file, label]
  CATALOG = [
    {
      id: "hoodie", name: "PATTERN SEEKER", status: "live", link: `${STORE}/products/pattern-seeker`, kind: "Full-zip hoodie · heavy-blend fleece · DTFx",
      about: "The mark and the name on the left chest. The constellation and <i>finding patterns in the noise</i> across the back. One node in the constellation is an open ring, on purpose.",
      img: [["store-front.avif", "Front, store photo"], ["store-back.webp", "Back, store photo"], ["back.png", "Back print", "#111"], ["front.png", "Chest print", "#111"]],
      files: [["front.png", "Chest · 1200×340 · 4 × 1.13 in"], ["front.svg", "Chest · SVG"], ["back.png", "Back · 3300×2100 · 11 × 7 in"], ["back.svg", "Back · SVG"]]
    },
    {
      id: "mug", name: "Apophenia Mug", status: "live", link: `${STORE}/products/apophenia-mug`, kind: "White glossy ceramic · sublimation · 11 / 15 / 20 oz",
      about: "One side is the mark and the name. The other is the mark's skeleton pulled wide: its four dots and its top and bottom bars, with nothing between them.",
      hidden: "The bars are Morse code: <b>apophenia</b> on top, <b>not crazy</b> below.",
      img: [["render-1.webp", "Handle left"], ["render-2.webp", "Handle right"], ["mug-preview.png", "Print file", "#fff"]],
      files: [["mug.png", "Wrap · 2700×1050 · 9 × 3.5 in"], ["board.png", "Approval board"]]
    },
    {
      id: "glass", name: "Apophenia 16 oz Glass", status: "live", link: `${STORE}/products/apophenia-16-oz-glass`, kind: "UV on clear glass · 16 oz",
      about: "The hoodie's back constellation, on its own, on the front. The mark and name sit round the back, beside the print seam, and low, so their mirror image through the glass falls under the art.",
      img: [["render-1.webp", "Front"], ["render-2.webp", "Turned"], ["glass-ink-preview.png", "Print file", "#fff"]],
      files: [["glass-ink.png", "Wrap, dark ink · 2874×1512 · 9.58 × 5.04 in"], ["glass-white.png", "Wrap, white ink (alternative)"], ["board.png", "Approval board"]]
    },
    {
      id: "clear-bottle", name: "Apophenia Clear Bottle", status: "live", link: `${STORE}/products/apophenia-clear-bottle`, kind: "UV on clear Tritan · 27 oz",
      about: "A thin network runs round the bottle and ends on a dot at each side. The bottle is clear, so the far side shows through behind the near side and the network forms a new pattern every time you turn it. The mark and name sit centred under it.",
      img: [["render-1.webp", "Front"], ["render-2.webp", "From above"], ["clear-bottle-preview.png", "Print file", "#e7e5e4"]],
      files: [["clear-bottle.png", "Wrap · 2837×2858 · 9.46 × 9.53 in"], ["board.png", "Approval board"]]
    },
    {
      id: "steel-bottle", name: "Apophenia Steel Bottle", status: "live", link: `${STORE}/products/apophenia-steel-bottle`, kind: "Black stainless steel · UV · 24 oz",
      about: "A field of random dots, and in it a few of them connected into the mark: the pattern found in the noise. The mark and name sit under it.",
      img: [["render-1.webp", "Front"], ["render-2.webp", "From above"], ["steel-bottle-preview.png", "Print file", "#18181b"]],
      files: [["steel-bottle.png", "Label · 2726×3262 · 9.09 × 10.87 in"], ["board.png", "Approval board"]]
    },
    {
      id: "backpack", name: "Apophenia Backpack", status: "live", link: `${STORE}/products/apophenia-backpack`, kind: "All-over print · 16 × 12 × 5.5 in",
      about: "Random dots over the whole bag. One set of them is connected, and it's the mark. The lockup sits low on the front, the way the hoodie carries it on the chest.",
      note: "Fourthwall can't build all-over-print bags through its API, so this one goes up through their admin designer. The mockup is a composite on their blank photo.",
      img: [["mockup.jpg", "Front, composite"], ["backpack-front-preview.png", "Front panel", "#0b0d17"]],
      files: [["backpack-front.png", "Front panel · 3660×4830 · 12.2 × 16.1 in"], ["backpack-fill.png", "Fill for the other panels · 4800 px, 24 in square"], ["board.png", "Approval board"]]
    },
    {
      id: "duffle", name: "Apophenia Duffle Bag", status: "approved", kind: "All-over print · 22 × 11.5 × 11.5 in",
      about: "The end panels carry the mark, big, with the name. The long sides have the mark in the noise, with one of its diagonals carried on toward the ends of the bag.",
      hidden: "That line is Morse: <b>not crazy</b> one way, <b>apophenia</b> the other.",
      note: "Fourthwall can't build all-over-print bags through its API, so this one goes up through their admin designer. The mockup is a composite on their blank photo.",
      img: [["mockup.jpg", "Composite"], ["duffle-front-preview.png", "Long side", "#0b0d17"], ["duffle-end-preview.png", "End panel", "#0b0d17"]],
      files: [["duffle-front.png", "Long sides, front and back · 6775×4500 · Fourthwall\u2019s 27.1 × 18 in canvas"], ["duffle-end.png", "End panel · 3450×3450 · 11.5 in square"], ["duffle-fill.png", "Fill for the other panels · 4800 px, 24 in square"], ["board.png", "Approval board"]]
    },
  ],
  logo = `<svg viewBox="0 0 120 120" width="40" height="40" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs>
<rect x="6" y="6" width="108" height="108" rx="28" fill="#fff" stroke="url(#g)" stroke-width="8"/><path d="M36 36L84 84M84 36L36 84M36 36H84M36 84H84" stroke="#111827" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"/>
<circle cx="36" cy="36" r="8" fill="#4f46e5"/><circle cx="84" cy="36" r="8" fill="#0ea5e9"/><circle cx="36" cy="84" r="8" fill="#0ea5e9"/><circle cx="84" cy="84" r="8" fill="#4f46e5"/><circle cx="60" cy="60" r="10" fill="#111827"/></svg>`,
  order = Object.keys(STATUS),
  card = (d) => `
<section class="d" id="${d.id}">
  <div class="top"><h2>${d.link ? `<a href="${d.link}">${d.name}</a>` : d.name}</h2><span class="s ${d.status}">${STATUS[d.status]}</span></div>
  <p class="kind">${d.kind}</p>
  <div class="imgs">${d.img.map(([f, c, bg]) => `<a href="art/${d.id}/${f}"><figure><img src="art/${d.id}/${f}" alt="${d.name}: ${c}" loading="lazy" style="background:${bg || "#ececee"}"><figcaption>${c}</figcaption></figure></a>`).join("")}</div>
  <p>${d.about}</p>${d.hidden ? `\n  <p class="egg"><b>Hidden:</b> ${d.hidden}</p>` : ""}${d.note ? `\n  <p class="note">${d.note}</p>` : ""}
  <ul class="files">${d.files.map(([f, l]) => `<li><a href="art/${d.id}/${f}">${l}</a></li>`).join("")}</ul>
</section>`;

fs.writeFileSync(new URL("../index.html", import.meta.url), `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Merch designs · apophenia.news</title>
<meta name="description" content="Every apophenia.news merch design: print files, mockups and notes.">
<meta name="theme-color" content="#fcfcfa">
<link rel="icon" type="image/svg+xml" href="https://apophenia.news/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}body{margin:0;background:#fcfcfa;color:#15151b;font:17px/1.55 "Space Grotesk",system-ui,sans-serif}
a{color:inherit}.shell{max-width:1180px;margin:0 auto;padding:0 22px}
header{border-bottom:1px solid #e4e4e7;background:#fcfcfaf2;position:sticky;top:0;z-index:2}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 22px}.brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.brand b{font:700 18px/1 "Google Sans Flex",sans-serif;display:block}.brand small{font:13px "Google Sans Flex",sans-serif;color:#71717a}
nav a{margin-left:18px;font-size:15px;text-decoration:none;color:#3f3f46}nav a:hover{color:#4f46e5}
.intro{padding:40px 0 8px}.intro h1{font:700 38px/1.15 "Google Sans Flex",sans-serif;margin:0 0 8px}.intro p{margin:0;color:#52525b;max-width:720px}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 0;padding:0;list-style:none}.toc a{display:block;padding:6px 12px;border:1px solid #e4e4e7;border-radius:999px;font-size:14px;text-decoration:none;background:#fff}
.d{margin:34px 0;padding:26px;background:#fff;border:1px solid #ececee;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.05)}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.d h2{font:700 26px/1.2 "Google Sans Flex",sans-serif;margin:0}.d h2 a{text-decoration:none}
.s{font-size:13px;padding:4px 10px;border-radius:999px;white-space:nowrap}.live{background:#dcfce7;color:#166534}.approved{background:#eef2ff;color:#4338ca}
.kind{margin:2px 0 16px;color:#71717a;font-size:15px}
.imgs{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory}.imgs a{flex:0 0 auto;scroll-snap-align:start;text-decoration:none}
figure{margin:0}.imgs img{display:block;height:300px;width:auto;max-width:min(540px,84vw);object-fit:contain;border-radius:14px;border:1px solid #ececee}figcaption{font-size:13px;color:#71717a;margin-top:6px}
.egg{border-left:3px solid #4f46e5;padding-left:12px}.egg b{color:#4f46e5;font-weight:600}.note{font-size:14px;color:#71717a}
.files{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0;padding:0;list-style:none}.files a{display:block;padding:7px 12px;border-radius:10px;background:#f4f4f5;font-size:14px;text-decoration:none}.files a:hover{background:#eef2ff;color:#4338ca}
footer{padding:30px 0 50px;color:#71717a;font-size:14px}
@media(max-width:640px){.intro h1{font-size:30px}.imgs img{height:240px}.d{padding:18px}nav a:first-child{display:none}}
</style>
</head>
<body>
<header><div class="bar shell"><a class="brand" href="https://apophenia.news">${logo}<span><b>apophenia.news</b><small>merch designs</small></span></a>
<nav><a href="https://apophenia.news">Site</a><a href="${STORE}">Store</a><a href="https://github.com/ApopheniaNews/merch">Source</a></nav></div></header>
<main class="shell">
<div class="intro"><h1>Merch designs</h1><p>Every design we've made, with its print files, mockups and notes. The mark and the name are the core of each one, plus one small idea that fits the object.</p>
<ul class="toc">${[...CATALOG].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)).map((d) => `<li><a href="#${d.id}">${d.name}</a></li>`).join("")}</ul></div>
${[...CATALOG].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)).map(card).join("\n")}
</main>
<footer class="shell">Print files are 300 dpi PNGs, transparent wherever nothing prints. Code to rebuild everything is in <a href="https://github.com/ApopheniaNews/merch/tree/main/src">src/</a>.</footer>
</body>
</html>
`);
console.log("index.html");
