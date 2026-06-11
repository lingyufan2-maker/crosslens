param(
  [string]$Message = "update crosslens"
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host "Checking build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Build failed. Deployment stopped."
}

Write-Host "Checking git changes..." -ForegroundColor Cyan
$changes = git status --porcelain
if ($LASTEXITCODE -ne 0) {
  throw "Git status failed. Deployment stopped."
}

if (-not $changes) {
  Write-Host "No changes to deploy." -ForegroundColor Yellow
  exit 0
}

Write-Host "Adding files..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
  throw "Git add failed. Deployment stopped."
}

Write-Host "Committing..." -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "Git commit failed. Deployment stopped."
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
  throw "Git push failed. Deployment stopped."
}

Write-Host "Done. Vercel will deploy automatically." -ForegroundColor Green
