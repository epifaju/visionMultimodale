# Test de la correction CORS
Write-Host "Test de la correction CORS" -ForegroundColor Cyan

# 1. Vérifier que les services sont démarrés
Write-Host "`n1. Vérification des services..." -ForegroundColor Yellow

# Backend
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible" -ForegroundColor Red
    exit 1
}

# Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible" -ForegroundColor Red
    exit 1
}

# 2. Test CORS direct
Write-Host "`n2. Test CORS direct..." -ForegroundColor Yellow
try {
    $headers = @{"Origin"="http://localhost:5173"}
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers $headers
    Write-Host "✅ Test CORS réussi" -ForegroundColor Green
    Write-Host "   Status: $($corsResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "   CORS Headers présents: $($corsResponse.Headers.ContainsKey('Access-Control-Allow-Origin'))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test CORS échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test avec authentification
Write-Host "`n3. Test avec authentification..." -ForegroundColor Yellow
try {
    $loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
    
    $authHeaders = @{
        "Authorization"="Bearer $token"
        "Origin"="http://localhost:5173"
    }
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers $authHeaders
    Write-Host "✅ Test authentifié réussi" -ForegroundColor Green
    Write-Host "   Status: $($authResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test authentifié échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Instructions pour tester
Write-Host "`n4. Instructions pour tester dans le navigateur:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Connectez-vous avec: admin / admin123" -ForegroundColor White
Write-Host "   3. Allez dans l'onglet 'Traitement de Documents'" -ForegroundColor White
Write-Host "   4. Cliquez sur l'onglet 'Document uploadé'" -ForegroundColor White
Write-Host "   5. Vérifiez que les documents s'affichent sans erreur CORS" -ForegroundColor White
Write-Host "   6. Ouvrez la console du navigateur (F12) pour voir les logs" -ForegroundColor White

Write-Host "`n✅ Test de correction CORS terminé!" -ForegroundColor Green
