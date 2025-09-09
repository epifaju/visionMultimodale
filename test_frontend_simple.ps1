# Script de test simple pour le frontend

Write-Host "Test du frontend apres correction..." -ForegroundColor Green

# Aller dans le répertoire frontend
Set-Location frontend

Write-Host "Repertoire de travail: $(Get-Location)" -ForegroundColor Cyan

# Tester le script setup
Write-Host "Test du script setup..." -ForegroundColor Yellow
npm run setup

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'execution du script setup" -ForegroundColor Red
    exit 1
}

Write-Host "Script setup execute avec succes" -ForegroundColor Green

# Vérifier que le fichier .env a été créé
if (Test-Path ".env") {
    Write-Host "Fichier .env cree" -ForegroundColor Green
} else {
    Write-Host "Fichier .env non trouve" -ForegroundColor Red
}

Write-Host "Test du frontend termine avec succes!" -ForegroundColor Green
