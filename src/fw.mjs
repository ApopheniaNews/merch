// Fourthwall Open API helpers. Needs API_USERNAME / API_PASS in the env:
//   infisical run --silent --projectId 608c2773-3282-442b-bd96-163e76fec19d --env prod --path /fourthwall -- node fw.mjs preview <templateId> <png> <outDir> [placementStrategy]
// preview = upload + register the image, then POST /customizations (a draft design sketch, not a product) and save Fourthwall's rendered mockups.
import fs from "node:fs";
import path from "node:path";

const API = "https://api.fourthwall.com/open-api/v1.0",
  auth = "Basic " + Buffer.from(`${process.env.API_USERNAME}:${process.env.API_PASS}`).toString("base64"),
  call = async (m, p, body) => {
    const r = await fetch(API + p, { method: m, headers: { Authorization: auth, "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    const t = await r.text();
    if (!r.ok) throw new Error(`${m} ${p} → ${r.status} ${t}`);
    return t ? JSON.parse(t) : null;
  },
  pngSize = (b) => [b.readUInt32BE(16), b.readUInt32BE(20)];

export const upload = async (file) => {
  const bytes = fs.readFileSync(file), size = bytes.byteLength, [width, height] = pngSize(bytes),
    { uploadUrl, fileUrl } = await call("POST", "/media/upload-url", { fileName: path.basename(file), contentType: "image/png", size }),
    put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "image/png", "x-goog-content-length-range": `0,${size}` }, body: bytes });
  if (!put.ok) throw new Error(`upload ${put.status} ${await put.text()}`);
  return (await call("POST", "/media/images", { fileUrl, width, height })).id;
};

export const preview = async (templateId, file, outDir, placementStrategy = "FULL_REGION", region = "default") => {
  const imageId = await upload(file),
    res = await call("POST", "/customizations", { productTemplateId: templateId, regions: [{ region, imageId, placementStrategy }] });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/customization.json`, JSON.stringify(res, null, 1));
  await Promise.all(res.images.map(async (im, i) => fs.writeFileSync(`${outDir}/${i}.webp`, Buffer.from(await (await fetch(im.url)).arrayBuffer()))));
  return { imageId, customizationId: res.customizationId, n: res.images.length };
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === "preview") console.log(await preview(...a));
  else if (cmd === "get") console.log(JSON.stringify(await call("GET", a[0]), null, 1));
}
