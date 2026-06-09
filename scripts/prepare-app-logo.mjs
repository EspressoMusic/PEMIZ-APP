import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/icons/linky-app-logo.png");

function isBackdropPixel(r, g, b) {
  return r <= 45 && g <= 45 && b <= 45;
}

/** Flood-fill black canvas from image edges so corners become transparent. */
function stripEdgeBlack(data, width, height) {
  const pixels = width * height;
  const visited = new Uint8Array(pixels);
  const queue = new Int32Array(pixels);
  let head = 0;
  let tail = 0;

  const push = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBackdropPixel(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    data[i + 3] = 0;
    queue[tail++] = idx;
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }
}

async function main() {
  const sharp = (await import("sharp")).default;
  const source = readFileSync(logoPath);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  stripEdgeBlack(data, info.width, info.height);

  const cleaned = await sharp(data, { raw: info }).png().toBuffer();
  writeFileSync(logoPath, cleaned);
  console.log("Prepared transparent logo:", logoPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
