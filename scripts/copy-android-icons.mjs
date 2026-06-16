/**
 * Copies Linky web icons into Android mipmap folders for the Capacitor shell.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/icons/linky-app-logo.png");
const androidRes = join(root, "mobile/android/app/src/main/res");
const background = "#E6D4B8";

const targets = [
  { folder: "mipmap-mdpi", size: 48 },
  { folder: "mipmap-hdpi", size: 72 },
  { folder: "mipmap-xhdpi", size: 96 },
  { folder: "mipmap-xxhdpi", size: 144 },
  { folder: "mipmap-xxxhdpi", size: 192 },
];

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Missing sharp. Run: npm install -D sharp");
    process.exit(1);
  }

  if (!existsSync(logoPath)) {
    console.error(`Logo not found: ${logoPath}`);
    process.exit(1);
  }

  const logo = readFileSync(logoPath);

  for (const { folder, size } of targets) {
    const dir = join(androidRes, folder);
    if (!existsSync(dir)) continue;

    const png = await sharp(logo)
      .resize(size, size)
      .flatten({ background })
      .png()
      .toBuffer();

    for (const name of [
      "ic_launcher.png",
      "ic_launcher_round.png",
      "ic_launcher_foreground.png",
    ]) {
      const out = join(dir, name);
      if (existsSync(out)) {
        const { writeFileSync } = await import("node:fs");
        writeFileSync(out, png);
        console.log(`Wrote ${folder}/${name}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
