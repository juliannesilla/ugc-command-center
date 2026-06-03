# refresh-local.ps1 - Part B: local SideShift auto-refresh (Sprint 1).
# Runs via Windows Task Scheduler every ~15 min while the PC is on. Polls SideShift
# through the already-authenticated Chrome profile (no Claude session needed),
# scores new threads, merges canonical, regenerates JSON, and pushes to main ONLY
# on a data delta -> Vercel auto-redeploys.
#
# One-time setup (Julz): node scripts/poll-sideshift.mjs --setup  (sign in once)
# Register task:        see scripts/register-refresh-task.ps1  (or run this file manually)

$ErrorActionPreference = 'Continue'
$repo = 'C:\Users\julia\OneDrive\Desktop\ugc-command-center'
Set-Location $repo

Write-Output ("[refresh-local] start " + (Get-Date -Format s))

node scripts/poll-sideshift.mjs
node scripts/score-brand-fit.mjs
node scripts/merge-canonical.mjs --apply
node scripts/jsonl-to-json.mjs

$delta = git status --porcelain data/
if ($delta) {
  git add data/
  git commit -m ("refresh-local: sideshift auto-poll " + (Get-Date -Format s))
  git push origin main
  Write-Output "[refresh-local] pushed data delta -> Vercel will redeploy"
} else {
  Write-Output "[refresh-local] no data delta - nothing to push"
}