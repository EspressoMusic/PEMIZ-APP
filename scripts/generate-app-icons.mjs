import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/icons/linky-app-logo.png");
const outDir = join(root, "public/icons");
const publicDir = join(root, "public");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error(
      "Missing sharp. Run: npm install -D sharp && node scripts/generate-app-icons.mjs"
    );
    process.exit(1);
  }

  const logo = readFileSync(logoPath);
  const sizes = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "favicon-32.png", size: 32 },
  ];

  for (const { name, size } of sizes) {
    await sharp(logo).resize(size, size).png().toFile(join(outDir, name));
    console.log(`Wrote ${name}`);
  }

  await sharp(logo).resize(32, 32).png().toFile(join(publicDir, "favicon.ico"));
  console.log("Wrote favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
