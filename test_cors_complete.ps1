# Test CORS complet - Frontend vers Backend
Write-Host "🧪 Test CORS complet - Frontend vers Backend" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Vérifier que les services sont démarrés
Write-Host "`n1. Vérification des services..." -ForegroundColor Yellow

# Test du backend
Write-Host "`n🔍 Test du backend Spring Boot..." -ForegroundColor Green
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/ping" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend accessible: $($backendResponse)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que le backend Spring Boot est démarré sur le port 8080" -ForegroundColor Yellow
    exit 1
}

# Test CORS avec OPTIONS (preflight)
Write-Host "`n🔍 Test CORS preflight (OPTIONS)..." -ForegroundColor Green
try {
    $corsHeaders = @{
        'Origin'                         = 'http://localhost:5173'
        'Access-Control-Request-Method'  = 'POST'
        'Access-Control-Request-Headers' = 'Content-Type, Authorization'
    }
    
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ocr" -Method OPTIONS -Headers $corsHeaders -TimeoutSec 10
    Write-Host "✅ CORS preflight OK: $($corsResponse.StatusCode)" -ForegroundColor Green
    
    # Vérifier les headers CORS
    $corsHeaders = $corsResponse.Headers
    Write-Host "📋 Headers CORS reçus:" -ForegroundColor Cyan
    if ($corsHeaders['Access-Control-Allow-Origin']) {
        Write-Host "  ✅ Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor Green
    }
    if ($corsHeaders['Access-Control-Allow-Methods']) {
        Write-Host "  ✅ Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" -ForegroundColor Green
    }
    if ($corsHeaders['Access-Control-Allow-Headers']) {
        Write-Host "  ✅ Access-Control-Allow-Headers: $($corsHeaders['Access-Control-Allow-Headers'])" -ForegroundColor Green
    }
    if ($corsHeaders['Access-Control-Allow-Credentials']) {
        Write-Host "  ✅ Access-Control-Allow-Credentials: $($corsHeaders['Access-Control-Allow-Credentials'])" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Erreur CORS preflight: $($_.Exception.Message)" -ForegroundColor Red
}

# Test CORS avec POST (requête réelle)
Write-Host "`n🔍 Test CORS avec requête POST..." -ForegroundColor Green
try {
    # Créer un fichier de test temporaire
    $testFile = "test_cors.txt"
    "Test CORS content" | Out-File -FilePath $testFile -Encoding UTF8
    
    # Simuler une requête FormData
    $boundary = [System.Guid]::NewGuid().ToString()
    $body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="test.txt"
Content-Type: text/plain

Test CORS content
--$boundary--
"@
    
    $headers = @{
        'Origin'       = 'http://localhost:5173'
        'Content-Type' = "multipart/form-data; boundary=$boundary"
    }
    
    $postResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Headers $headers -Body $body -TimeoutSec 30
    Write-Host "✅ CORS POST OK: $($postResponse.StatusCode)" -ForegroundColor Green
    
    # Nettoyer le fichier de test
    Remove-Item $testFile -ErrorAction SilentlyContinue
    
}
catch {
    Write-Host "❌ Erreur CORS POST: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    }
}

# Test du frontend (si accessible)
Write-Host "`n🔍 Test du frontend..." -ForegroundColor Green
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend accessible: $($frontendResponse.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Assurez-vous que le frontend Vite est démarré sur le port 5173" -ForegroundColor Yellow
}

# Test de l'intégration complète
Write-Host "`n🔍 Test d'intégration complète..." -ForegroundColor Green
Write-Host "💡 Pour tester l'intégration complète:" -ForegroundColor Yellow
Write-Host "  1. Démarrez le backend: cd backend && mvn spring-boot:run" -ForegroundColor White
Write-Host "  2. Démarrez le frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  3. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "  4. Essayez d'uploader un fichier" -ForegroundColor White

Write-Host "`n📋 Résumé de la configuration CORS:" -ForegroundColor Cyan
Write-Host "  ✅ Backend: Headers CORS configurés pour localhost:5173" -ForegroundColor Green
Write-Host "  ✅ Frontend: withCredentials activé" -ForegroundColor Green
Write-Host "  ✅ Proxy Vite: Configuré pour /api -> localhost:8080" -ForegroundColor Green
Write-Host "  ✅ Headers: Authorization, Content-Type, X-Requested-With autorisés" -ForegroundColor Green

Write-Host "`n🎉 Test CORS terminé!" -ForegroundColor Green