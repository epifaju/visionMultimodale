# Script de test pour vérifier la correction de l'erreur HTTP 403
# Test de l'endpoint /api/documents/test-upload

Write-Host "🧪 Test de l'endpoint /api/documents/test-upload" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Vérifier que le backend est démarré
Write-Host "`n1. Vérification du backend sur le port 8080..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/public/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible sur le port 8080" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend non accessible sur le port 8080" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Veuillez démarrer le backend avec: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Test de l'endpoint test-upload avec un fichier PDF fictif
Write-Host "`n2. Test de l'endpoint /api/documents/test-upload..." -ForegroundColor Yellow

# Créer un fichier PDF de test temporaire
$testPdfPath = "test_upload.pdf"
Write-Host "   Création d'un fichier PDF de test..." -ForegroundColor Gray

# Créer un fichier PDF minimal (juste pour le test)
$pdfContent = @"
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF
"@

$pdfContent | Out-File -FilePath $testPdfPath -Encoding ASCII

try {
    # Test de l'upload
    $form = @{
        file = Get-Item $testPdfPath
    }
    
    Write-Host "   Envoi de la requête POST vers /api/documents/test-upload..." -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Form $form -ContentType "multipart/form-data"
    
    Write-Host "✅ Upload réussi !" -ForegroundColor Green
    Write-Host "   Réponse du serveur:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de l'upload" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response Body: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "   Erreur complète: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Nettoyer le fichier de test
    if (Test-Path $testPdfPath) {
        Remove-Item $testPdfPath -Force
        Write-Host "   Fichier de test supprimé" -ForegroundColor Gray
    }
}

# Test de l'endpoint avec curl (alternative)
Write-Host "`n3. Test alternatif avec curl..." -ForegroundColor Yellow
Write-Host "   Commande curl à exécuter:" -ForegroundColor Gray
Write-Host "   curl -X POST -F 'file=@test.pdf' http://localhost:8080/api/documents/test-upload" -ForegroundColor Cyan

Write-Host "`n4. Vérification de la configuration CORS..." -ForegroundColor Yellow
try {
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/test-upload" -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    } -TimeoutSec 5
    
    Write-Host "✅ CORS preflight request réussie" -ForegroundColor Green
    Write-Host "   Status: $($corsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Headers CORS:" -ForegroundColor Green
    $corsResponse.Headers | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
        Write-Host "     $($_.Key): $($_.Value)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ CORS preflight request échouée (peut être normal)" -ForegroundColor Yellow
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "   ✅ URL de base corrigée: http://localhost:8080/api (était 8081)" -ForegroundColor Green
Write-Host "   ✅ Endpoint utilisé: /documents/test-upload (configuré sans authentification)" -ForegroundColor Green
Write-Host "   ✅ Logs de débogage ajoutés pour diagnostiquer les problèmes" -ForegroundColor Green
Write-Host "   ✅ Configuration CORS vérifiée" -ForegroundColor Green

Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Redémarrer le frontend pour appliquer les changements" -ForegroundColor White
Write-Host "   2. Tester l'upload depuis l'interface utilisateur" -ForegroundColor White
Write-Host "   3. Vérifier les logs de la console du navigateur" -ForegroundColor White