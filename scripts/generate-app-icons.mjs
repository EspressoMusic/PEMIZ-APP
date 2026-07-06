import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/icons/linky-app-logo.png");
const loadingLogoPath = join(root, "public/icons/linky-loading-logo.png");
const outDir = join(root, "public/icons");
const publicDir = join(root, "public");
const appDir = join(root, "src/app");

const mobileSplashDirs = [
  "mobile/android/app/src/main/res/drawable",
  "mobile/android/app/src/main/res/drawable-port-mdpi",
  "mobile/android/app/src/main/res/drawable-port-hdpi",
  "mobile/android/app/src/main/res/drawable-port-xhdpi",
  "mobile/android/app/src/main/res/drawable-port-xxhdpi",
  "mobile/android/app/src/main/res/drawable-port-xxxhdpi",
  "mobile/android/app/src/main/res/drawable-land-mdpi",
  "mobile/android/app/src/main/res/drawable-land-hdpi",
  "mobile/android/app/src/main/res/drawable-land-xhdpi",
  "mobile/android/app/src/main/res/drawable-land-xxhdpi",
  "mobile/android/app/src/main/res/drawable-land-xxxhdpi",
];

const iosSplashDir = join(
  root,
  "mobile/ios/App/App/Assets.xcassets/Splash.imageset"
);

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

  const iconPipeline = (size) => sharp(logo).resize(size, size);

  /**
   * Android/Web Push badge — white silhouette only (transparent bg).
   * Android masks this by alpha alone, ignoring RGB, so the mask must be
   * built from the artwork's ink (dark lines) vs. its light fill, not from
   * the source PNG's own alpha channel — otherwise opaque light fill (e.g.
   * a face background) and opaque dark linework both become one solid
   * blob and the icon reads as a plain white square in the status bar.
   */
  async function writeNotificationBadge(name, size) {
    const { data, info } = await sharp(readFileSync(loadingLogoPath))
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const luminosity = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      if (alpha > 24 && luminosity < 128) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }

    await sharp(Buffer.from(data), {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toFile(join(outDir, name));
    console.log(`Wrote ${name}`);
  }

  /** Large notification icon — character logo on turquoise (readable on Android). */
  async function writeNotificationIcon(name, size) {
    const inner = Math.round(size * 0.72);
    const character = await sharp(readFileSync(loadingLogoPath))
      .resize(inner, inner, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 165, g: 212, b: 204, alpha: 255 },
      },
    })
      .composite([{ input: character, gravity: "center" }])
      .png()
      .toFile(join(outDir, name));
    console.log(`Wrote ${name}`);
  }

  for (const { name, size } of sizes) {
    await iconPipeline(size).png().toFile(join(outDir, name));
    console.log(`Wrote ${name}`);
  }

  await writeNotificationBadge("notification-badge.png", 96);
  await writeNotificationIcon("notification-icon.png", 192);

  const favicon32 = await iconPipeline(32).png().toBuffer();
  writeFileSync(join(publicDir, "favicon.ico"), favicon32);
  writeFileSync(join(appDir, "favicon.ico"), favicon32);
  console.log("Wrote favicon.ico (public + src/app)");

  const icon192 = await iconPipeline(192).png().toBuffer();
  writeFileSync(join(appDir, "icon.png"), icon192);
  console.log("Wrote src/app/icon.png");

  const apple180 = await iconPipeline(180).png().toBuffer();
  writeFileSync(join(appDir, "apple-icon.png"), apple180);
  console.log("Wrote src/app/apple-icon.png");

  const splashSize = 2732;
  const splash = await sharp(logo).resize(splashSize, splashSize).png().toBuffer();

  for (const rel of mobileSplashDirs) {
    const dir = join(root, rel);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "splash.png"), splash);
    console.log(`Wrote ${rel}/splash.png`);
  }

  for (const name of [
    "splash-2732x2732.png",
    "splash-2732x2732-1.png",
    "splash-2732x2732-2.png",
  ]) {
    writeFileSync(join(iosSplashDir, name), splash);
    console.log(`Wrote Splash.imageset/${name}`);
  }

  const launcherSizes = [
    { dir: "mipmap-mdpi", size: 108 },
    { dir: "mipmap-hdpi", size: 162 },
    { dir: "mipmap-xhdpi", size: 216 },
    { dir: "mipmap-xxhdpi", size: 324 },
    { dir: "mipmap-xxxhdpi", size: 432 },
  ];

  for (const { dir, size } of launcherSizes) {
    const base = join(root, "mobile/android/app/src/main/res", dir);
    const png = await iconPipeline(size).png().toBuffer();
    writeFileSync(join(base, "ic_launcher.png"), png);
    writeFileSync(join(base, "ic_launcher_round.png"), png);
    writeFileSync(join(base, "ic_launcher_foreground.png"), png);
    console.log(`Wrote ${dir}/ic_launcher*.png`);
  }

  const iosAppIcon = join(
    root,
    "mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
  );
  await iconPipeline(1024).png().toFile(iosAppIcon);
  console.log("Wrote iOS AppIcon-512@2x.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
