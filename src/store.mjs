// The store listings. Creates each product hidden, then prints every variant's price and cost so they can be checked before going public.
// usage (Fourthwall creds from infisical, see README):
//   node src/store.mjs create <key...>     → hidden products; ids saved to store.json
//   node src/store.mjs check               → price / cost / profit per variant
//   node src/store.mjs publish <key...>    → make them public
import fs from "node:fs";
import { product, get, setState } from "./fw.mjs";

const art = (f) => new URL(`../art/${f}`, import.meta.url).pathname, saved = new URL("../store.json", import.meta.url).pathname,
  ids = fs.existsSync(saved) ? JSON.parse(fs.readFileSync(saved)) : {},
  LISTINGS = {
    mug: {
      template: "pro_4v5OfYhyRx62KW5b7Oj6Uw", file: art("mug/mug.png"), profit: 4, name: "Apophenia Mug", sizes: ["11oz", "15oz", "20 oz"], // without sizes only 11 oz is made
      description: "<p>The mark and the name on one side. On the other, the mark's four dots and its two bars, with nothing between them. Look closely.</p><p>White glossy ceramic, dishwasher and microwave safe. 11, 15 or 20 oz.</p>"
    },
    glass: {
      template: "pro_KLKGnobKR0u-aO6RghFzxA", file: art("glass/glass-ink.png"), profit: 1, name: "Apophenia 16 oz Glass",
      description: "<p>The constellation from the PATTERN SEEKER hoodie, on clear glass. The mark and the name are round the back.</p><p>16 oz (473 ml) glass, 5.87″ tall. Hand-wash only: not dishwasher or microwave safe.</p>"
    },
    "clear-bottle": {
      template: "pro_Ev93jJN7Sg2shZI9WjJKqg", file: art("clear-bottle/clear-bottle.png"), profit: 8, name: "Apophenia Clear Bottle",
      description: "<p>A network of dots runs round the bottle. It's clear, so the far side shows through the near side, and the pattern changes as you turn it.</p><p>27 oz (798 ml) BPA-free Tritan, 10.16″ tall. Spill-resistant stainless steel lid with a carry loop.</p>"
    },
    "steel-bottle": {
      template: "pro_lcY8lsUxT0abgQ35lT919g", file: art("steel-bottle/steel-bottle.png"), profit: 8, name: "Apophenia Steel Bottle", colors: ["Black"],
      description: "<p>A field of random dots, and in it a few connected into the mark: the pattern found in the noise.</p><p>24 oz (710 ml) black 18/8 stainless steel, BPA-free. Threaded lid. Hand-wash only.</p>"
    },
    backpack: {
      template: "pro_f5fdfe4ae25248499e", file: art("backpack/backpack-front.png"), profit: 8, name: "Apophenia Backpack", region: "front",
      description: "<p>Random dots over the whole bag. One set of them is connected, and it's the mark.</p><p>All-over print on water-resistant 100% polyester. 16.1 × 12.2 × 5.5″, 20 L, fits a 15″ laptop.</p>"
    },
    duffle: {
      template: "pro_4cb50ea9e50d4f83be", file: art("duffle/duffle-front.png"), profit: 8, name: "Apophenia Duffle Bag", region: "front",
      description: "<p>The mark on the end panels, and the mark in the noise along the sides, with one of its lines carried on to the ends of the bag. Look closely.</p><p>All-over print, 100% polyester. 22 × 11.5 × 11.5″, 50 L.</p>"
    }
  },
  [cmd, ...keys] = process.argv.slice(2);

if (cmd === "create")
  for (const k of keys) {
    try {
      const r = await product(LISTINGS[k]);
      ids[k] = r.productId;
      fs.writeFileSync(saved, JSON.stringify(ids, null, 1) + "\n");
      console.log(k, "created hidden:", r.productId, `${r.images.length} images`);
    } catch (e) { console.log(k, "FAILED:", e.message.slice(0, 400)); }
  }
if (cmd === "check")
  for (const [k, id] of Object.entries(ids)) {
    const p = await get(`/products/${id}`);
    console.log(`${k}: "${p.name}" ${p.access?.type} · ${p.images.length} images · /products/${p.slug}${/pint|beer/i.test(p.name + p.description) ? " · WARNING: mentions pint/beer" : ""}`);
    for (const v of p.variants) console.log(`   ${v.attributes.description.padEnd(22)} $${v.unitPrice.value.toFixed(2)}  cost $${v.unitCost?.value?.toFixed(2)}  profit $${(v.unitPrice.value - (v.unitCost?.value ?? NaN)).toFixed(2)}`);
  }
if (cmd === "publish") for (const k of keys) console.log(k, (await setState(ids[k], "PUBLIC")) ? "public" : "public");
