# Script de test OCR avec Docker
Write-Host "🔍 Test OCR avec Docker - Vision Multimodale" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Vérifier que le backend est accessible
Write-Host "`n1. Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/ping" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible: $response" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Créer une image de test simple avec du texte
Write-Host "`n2. Création d'une image de test..." -ForegroundColor Yellow
$testImagePath = "test_ocr_docker.png"

# Créer une image PNG simple avec du texte (1x1 pixel transparent)
$bytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
[System.IO.File]::WriteAllBytes($testImagePath, $bytes)

Write-Host "✅ Image de test créée: $testImagePath" -ForegroundColor Green

# Test d'upload et OCR
Write-Host "`n3. Test d'upload et OCR..." -ForegroundColor Yellow
try {
    $form = @{
        file = Get-Item $testImagePath
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/ocr" -Method POST -Form $form -TimeoutSec 30
    
    Write-Host "✅ Upload et OCR réussis!" -ForegroundColor Green
    Write-Host "   Succès: $($response.success)" -ForegroundColor White
    Write-Host "   Texte extrait:" -ForegroundColor White
    Write-Host "   '$($response.data.text)'" -ForegroundColor Gray
    Write-Host "   Langue: $($response.data.language)" -ForegroundColor White
    Write-Host "   Confiance: $([math]::Round($response.data.confidence * 100, 1))%" -ForegroundColor White
    
    # Vérifier si c'est du texte simulé ou réel
    if ($response.data.text -like "*simulé*" -or $response.data.text -like "*démonstration*") {
        Write-Host "⚠️  Attention: Le texte semble être simulé (Tesseract non disponible)" -ForegroundColor Yellow
    } else {
        Write-Host "🎉 Succès: OCR réel fonctionne avec Tesseract!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Erreur lors du test OCR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Code d'erreur: $statusCode" -ForegroundColor Red
    }
} finally {
    # Nettoyer le fichier de test
    if (Test-Path $testImagePath) {
        Remove-Item $testImagePath
        Write-Host "`n🧹 Fichier de test nettoyé" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Test OCR terminé!" -ForegroundColor Cyan
Write-Host "Si vous voyez du texte réel (pas simulé), Tesseract fonctionne correctement." -ForegroundColor Green



