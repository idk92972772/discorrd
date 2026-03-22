# install-theme.ps1
# Usage: install-theme.ps1 -ThemeName "Midnight" -ThemeUrl "https://..."
param(
  [string]$ThemeName,
  [string]$ThemeUrl
)

$themesDir = "$env:APPDATA\Vencord\themes"

if (-not (Test-Path $themesDir)) {
  New-Item -ItemType Directory -Path $themesDir -Force | Out-Null
}

$outFile = Join-Path $themesDir "$ThemeName.theme.css"

Write-Host ""
Write-Host "  Installing theme: $ThemeName" -ForegroundColor Cyan
Write-Host "  Downloading from: $ThemeUrl" -ForegroundColor Gray
Write-Host ""

try {
  Invoke-WebRequest -Uri $ThemeUrl -OutFile $outFile -UseBasicParsing
  Write-Host "  Done! Theme saved to:" -ForegroundColor Green
  Write-Host "  $outFile" -ForegroundColor White
  Write-Host ""
  Write-Host "  Reload Discord (Ctrl+R) to apply the theme." -ForegroundColor Yellow
} catch {
  Write-Host "  Failed to download theme." -ForegroundColor Red
  Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
