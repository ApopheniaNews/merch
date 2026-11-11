# apophenia.news merch

Every merch design, as code and as print files. The site at https://apophenianews.github.io/merch/ shows them all (built from `src/site.mjs`).

```
art/<design>/   print files (300 dpi PNG, transparent where nothing prints), previews, mockups, approval boards
src/            the code that makes all of it
index.html      the site (generated, don't edit by hand)
```

## Rebuild

```sh
bun install                 # the two fonts the art uses
npm run art                 # print files + previews for every product, and the hoodie (src/build.mjs, src/hoodie.mjs)
npm run mockups             # bag composites on the blank photos (needs uv; pulls numpy + opencv on the fly)
npm run boards              # approval boards and art/approval-sheet.png (src/sheet.mjs)
node src/site.mjs           # index.html
```

Headless Chromium does the rendering: it uses Playwright's `chromium_headless_shell` from `~/.cache/ms-playwright`, or `/opt/pw-browsers/chromium`.

## Where things live

- `src/designs.mjs` has the artwork for the mug, 16 oz glass, clear bottle, steel bottle, backpack and duffle, drawn as SVG in inches. Each piece notes how it sits on its product.
- `src/hoodie.mjs` is PATTERN SEEKER, the zip hoodie in the store, ported unchanged from the old in-browser generator.
- `src/store.mjs` holds the store listings (name, description, profit over Fourthwall's cost). It creates them hidden, checks every variant's price and cost, then publishes. The product ids are in `store.json`.
  ```sh
  infisical run --projectId 608c2773-3282-442b-bd96-163e76fec19d --env prod --path /fourthwall -- node src/store.mjs check
  ```
- `src/fw.mjs` handles Fourthwall: upload a print file and get Fourthwall's own mockups back. This creates a draft design sketch, not a product.
  ```sh
  infisical run --projectId 608c2773-3282-442b-bd96-163e76fec19d --env prod --path /fourthwall -- \
    node src/fw.mjs preview <templateId> art/mug/mug.png /tmp/preview
  ```
- `src/calib.mjs` makes labelled grids. Push one through `fw.mjs preview` to see exactly where a new product wraps the art.
- `src/mockup.py` builds the bag mockups. `src/hoodie-net.*` holds the hoodie constellation geometry, which the glass reuses.

## Fourthwall notes (learned from calibration grids)

| Ours | Fourthwall blank | Template | Print file | Where it lands |
|---|---|---|---|---|
| Apophenia Mug | White Glossy Mug | `pro_4v5OfYhyRx62KW5b7Oj6Uw` | 2700×1050 | Handle-left view shows about 0–35%, handle-right about 65–100%. Put one face at ~22% and the other at ~78%. |
| Apophenia 16 oz Glass | Shaker glass, 16 oz | `pro_KLKGnobKR0u-aO6RghFzxA` | 2874×1512 | Full wrap, front at 50%, seam at 0/100% (the back). Anything on the back shows through the front, mirrored. |
| Apophenia Clear Bottle | Thor Clear Tritan Sports Bottle | `pro_Ev93jJN7Sg2shZI9WjJKqg` | 2837×2858 | Full wrap of the body, front at 50%. The far side shows through. |
| Apophenia Steel Bottle | H2Go Bolt (black) | `pro_lcY8lsUxT0abgQ35lT919g` | 2726×3262 | A ~5 in label on the lower body covering only the front half (~186°), front at 50%. Keep the core within ~30–70% and draw big. |
| Apophenia Backpack | All-Over Print Minimalist Backpack | `pro_f5fdfe4ae25248499e` | panels | The API refuses it (no backend rendering): use the admin designer. Front = `backpack-front.png`, top and bottom = `backpack-fill.png`. |
| Apophenia Duffle Bag | All-Over Print Duffle Bag | `pro_4cb50ea9e50d4f83be` | panels | The API refuses it (no backend rendering): use the admin designer. Front and back = `duffle-front.png`, ends = `duffle-end.png`, everything else = `duffle-fill.png`. The API lists the "Sides" area as unavailable, so check where the ends go. |

All the art is original. Nothing is taken from real-world data.
