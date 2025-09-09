# Script de test pour vérifier que le frontend fonctionne après correction

Write-Host "🧪 Test du frontend après correction..." -ForegroundColor Green

# Aller dans le répertoire frontend
Set-Location frontend

Write-Host "📁 Répertoire de travail: $(Get-Location)" -ForegroundColor Cyan

# Nettoyer les dépendances et réinstaller
Write-Host "🧹 Nettoyage et réinstallation des dépendances..." -ForegroundColor Yellow
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green

# Tester le script setup
Write-Host "🔧 Test du script setup..." -ForegroundColor Yellow
npm run setup

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'exécution du script setup" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Script setup exécuté avec succès" -ForegroundColor Green

# Vérifier que le fichier .env a été créé
if (Test-Path ".env") {
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
    Get-Content ".env" | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}
else {
    Write-Host "❌ Fichier .env non trouvé" -ForegroundColor Red
}

# Tester la compilation TypeScript
Write-Host "🔨 Test de la compilation TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreurs de compilation TypeScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilation TypeScript réussie" -ForegroundColor Green

# Tester le build de production
Write-Host "🏗️ Test du build de production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build de production" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build de production réussi" -ForegroundColor Green

# Vérifier que les fichiers de build ont été créés
if (Test-Path "dist") {
    Write-Host "✅ Dossier dist créé" -ForegroundColor Green
    $distFiles = Get-ChildItem -Path "dist" -Recurse
    Write-Host "📁 Fichiers générés:" -ForegroundColor Cyan
    $distFiles | ForEach-Object { Write-Host "  $($_.FullName)" -ForegroundColor Gray }
}
else {
    Write-Host "❌ Dossier dist non trouvé" -ForegroundColor Red
}

Write-Host "`n🎯 Test du frontend termine avec succes!" -ForegroundColor Green
Write-Host "Le frontend est maintenant pret a etre utilise." -ForegroundColor Cyan
