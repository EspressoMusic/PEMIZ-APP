import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/icons/linky-app-logo.png");
const outDir = join(root, "public/icons");
const publicDir = join(root, "public");
const appDir = join(root, "src/app");

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

  const favicon32 = await sharp(logo).resize(32, 32).png().toBuffer();
  writeFileSync(join(publicDir, "favicon.ico"), favicon32);
  writeFileSync(join(appDir, "favicon.ico"), favicon32);
  console.log("Wrote favicon.ico (public + src/app)");

  const icon192 = await sharp(logo).resize(192, 192).png().toBuffer();
  writeFileSync(join(appDir, "icon.png"), icon192);
  console.log("Wrote src/app/icon.png");

  const apple180 = await sharp(logo).resize(180, 180).png().toBuffer();
  writeFileSync(join(appDir, "apple-icon.png"), apple180);
  console.log("Wrote src/app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
