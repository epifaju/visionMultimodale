#!/usr/bin/env pwsh

Write-Host "🐳 Test de l'OCR Docker" -ForegroundColor Green
Write-Host "======================="

# Vérifier que Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker disponible: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker non disponible" -ForegroundColor Red
    exit 1
}

# Vérifier l'image Tesseract
Write-Host "`n2. Vérification de l'image Tesseract..." -ForegroundColor Yellow
try {
    $images = docker images tesseractshadow/tesseract4re --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    Write-Host "✅ Images Tesseract disponibles:" -ForegroundColor Green
    Write-Host $images -ForegroundColor Gray
}
catch {
    Write-Host "❌ Image Tesseract non trouvée" -ForegroundColor Red
    exit 1
}

# Test simple de l'image Docker Tesseract
Write-Host "`n3. Test de l'image Docker Tesseract..." -ForegroundColor Yellow
try {
    # Créer un dossier temporaire
    $tempDir = New-Item -ItemType Directory -Path "temp-docker-test" -Force
    
    # Tester avec une commande simple
    Write-Host "   Exécution d'un test Tesseract dans Docker..." -ForegroundColor Gray
    
    $result = docker run --rm tesseractshadow/tesseract4re tesseract --version
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test Docker Tesseract réussi:" -ForegroundColor Green
        Write-Host "   $result" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Test Docker Tesseract échoué" -ForegroundColor Red
    }
    
    # Nettoyer
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
}
catch {
    Write-Host "❌ Erreur lors du test Docker: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de connectivité backend
Write-Host "`n4. Test de connectivité backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ping" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible (ping réussi)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Backend répond mais status: $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Test terminé!" -ForegroundColor Cyan
Write-Host "Vous pouvez maintenant tester l'OCR via l'interface web." -ForegroundColor Green
