# DigitalOcean sunucusuna backend dosyalarini gonder ve PM2'yi yeniden baslat
# Kullanim: .\deploy.ps1 -Key "C:\path\to\ssh_key" -User "root"
# Ornek:    .\deploy.ps1 -Key "$HOME\.ssh\id_rsa" -User "root"

param(
  [string]$Server = "134.122.84.92",
  [string]$User   = "root",
  [string]$Key    = "$HOME\.ssh\id_rsa",
  [string]$Dir    = "/root/marketly-backend"
)

Write-Host "=== Marketly Backend Deploy ===" -ForegroundColor Cyan
Write-Host "Sunucu: $User@$Server" -ForegroundColor Yellow

$scp = "scp"
$ssh = "ssh"
$keyArg = if ($Key) { @("-i", $Key) } else { @() }

# Degisen dosyalari gonder
$files = @(
  "server.js",
  "src\services\supabase.js",
  "src\services\forexService.js",
  "src\services\stocksService.js"
)

foreach ($f in $files) {
  $local  = Join-Path $PSScriptRoot $f
  $remote = "$User@{$Server}:$Dir/$($f -replace '\\','/')"
  Write-Host "Gonderiliyor: $f" -ForegroundColor Gray
  & $scp @keyArg $local "${User}@${Server}:${Dir}/$($f -replace '\\','/')"
}

# PM2 restart
Write-Host "`nPM2 yeniden baslatiliyor..." -ForegroundColor Yellow
& $ssh @keyArg "${User}@${Server}" "cd $Dir && pm2 restart marketly-api && pm2 logs marketly-api --lines 20 --nostream"

Write-Host "`n=== Deploy tamamlandi ===" -ForegroundColor Green
Write-Host "API: http://$Server:3001/health" -ForegroundColor Cyan
Write-Host "Durum: http://$Server:3001/api/prices/system/status" -ForegroundColor Cyan
