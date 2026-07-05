import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = join(root, "public/icons/linky-loading-logo.png");
const outputPath = inputPath;

const BLACK_MAX = 20;

function isBlack(data, i) {
  return (
    data[i] <= BLACK_MAX &&
    data[i + 1] <= BLACK_MAX &&
    data[i + 2] <= BLACK_MAX
  );
}

async function main() {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(readFileSync(inputPath))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const outer = new Uint8Array(w * h);
  const queue = [];

  for (let x = 0; x < w; x++) {
    queue.push([x, 0], [x, h - 1]);
  }
  for (let y = 0; y < h; y++) {
    queue.push([0, y], [w - 1, y]);
  }

  const index = (x, y) => y * w + x;

  while (queue.length) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const cell = index(x, y);
    if (outer[cell] || !isBlack(data, cell * 4)) continue;
    outer[cell] = 1;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  const out = Buffer.from(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cell = index(x, y);
      const i = cell * 4;
      if (outer[cell]) {
        out[i + 3] = 0;
      }
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log(`Wrote transparent loading logo: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
