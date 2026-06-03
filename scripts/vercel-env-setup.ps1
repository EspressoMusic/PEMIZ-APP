# Adds non-secret Vercel env vars for linky (run from repo root).
# Database URLs come from: Vercel → linky → Settings → Integrations → Supabase → Connect

$ErrorActionPreference = "Stop"
$sessionSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

function Add-VercelEnv($name, $value, $env) {
  $value | npx vercel env add $name $env --force 2>&1 | Out-Host
}

foreach ($target in @("production", "preview", "development")) {
  Add-VercelEnv "SESSION_SECRET" $sessionSecret $target
  Add-VercelEnv "MASTER_KEY" "11" $target
  Add-VercelEnv "ADMIN_EMAIL" "admin@linky.local" $target
  Add-VercelEnv "NEXT_PUBLIC_APP_URL" "https://linky.vercel.app" $target
}

Write-Host "Done. Connect Supabase in Vercel UI for POSTGRES_PRISMA_URL + POSTGRES_URL_NON_POOLING."
