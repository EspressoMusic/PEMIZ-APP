import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public/icons/linky-app-logo.png");
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

  for (const { name, size } of sizes) {
    await iconPipeline(size).png().toFile(join(outDir, name));
    console.log(`Wrote ${name}`);
  }

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
