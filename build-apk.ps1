# Build de l'APK Android — Hi-Lo Academy I
# Usage : clic droit > "Exécuter avec PowerShell", ou  ./build-apk.ps1
# Prérequis : chaîne portable installée dans D:\android-build-tools (JDK17 + SDK)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$env:JAVA_HOME = "D:\android-build-tools\jdk17"
$env:ANDROID_HOME = "D:\android-build-tools\sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host "== 1/3  Build web (Vite) ==" -ForegroundColor Cyan
Set-Location $root
npm run build

Write-Host "== 2/3  Sync Capacitor ==" -ForegroundColor Cyan
npx cap sync android

Write-Host "== 3/3  Build APK (Gradle) ==" -ForegroundColor Cyan
Set-Location "$root\android"
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nEchec Gradle (code $LASTEXITCODE) - APK non copie." -ForegroundColor Red
    Set-Location $root
    exit 1
}

$apk = "$root\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    $out = "$root\Blackjack-Academy.apk"
    Copy-Item $apk $out -Force
    Write-Host "`nAPK PRET :  $out" -ForegroundColor Green
} else {
    Write-Host "`nEchec : APK introuvable." -ForegroundColor Red
    exit 1
}
Set-Location $root
