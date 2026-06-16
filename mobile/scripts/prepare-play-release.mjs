/**
 * Sync Capacitor Android project for a production Play Store build.
 * Reads CAPACITOR_SERVER_URL or NEXT_PUBLIC_APP_URL from .env.local / environment.
 *
 * Usage: node mobile/scripts/prepare-play-release.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const mobileDir = join(root, "mobile");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const envLocal = loadEnvFile(join(root, ".env.local"));
const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  envLocal.CAPACITOR_SERVER_URL ||
  envLocal.NEXT_PUBLIC_APP_URL;

if (!serverUrl || /localhost|127\.0\.0\.1/i.test(serverUrl)) {
  console.error(
    "Set CAPACITOR_SERVER_URL or NEXT_PUBLIC_APP_URL to your deployed HTTPS URL before a Play release."
  );
  console.error("Example: CAPACITOR_SERVER_URL=https://your-app.vercel.app");
  process.exit(1);
}

if (!serverUrl.startsWith("https://")) {
  console.warn("Warning: Play Store builds should use HTTPS for server.url");
}

console.log(`Preparing Android shell → ${serverUrl}`);

const childEnv = {
  ...process.env,
  CAPACITOR_SERVER_URL: serverUrl,
  NEXT_PUBLIC_APP_URL: serverUrl,
};

execSync("npm run icons:generate", { cwd: root, stdio: "inherit", env: childEnv });
execSync("node scripts/copy-android-icons.mjs", {
  cwd: root,
  stdio: "inherit",
  env: childEnv,
});
execSync("npm run cap:sync", { cwd: mobileDir, stdio: "inherit", env: childEnv });

console.log("\nReady. Open Android Studio:");
console.log("  npm run mobile:android");
console.log("\nRelease bundle (after signing is configured):");
console.log("  npm run mobile:bundle");
