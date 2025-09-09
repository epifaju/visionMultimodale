# Script de test pour diagnostiquer la connectivité backend
Write-Host "🔍 Test de connectivité backend..." -ForegroundColor Cyan

# Test 1: Vérifier si le port 8080 est ouvert
Write-Host "`n1. Vérification du port 8080..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "✅ Port 8080 accessible" -ForegroundColor Green
}
else {
    Write-Host "❌ Port 8080 non accessible - Backend non démarré?" -ForegroundColor Red
    Write-Host "💡 Démarrer avec: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Test 2: Test HTTP simple
Write-Host "`n2. Test de l'endpoint health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/public/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint health accessible (Status: $($response.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "❌ Endpoint health inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test CORS preflight
Write-Host "`n3. Test CORS preflight pour /documents/ocr..." -ForegroundColor Yellow
try {
    $headers = @{
        'Origin'                         = 'http://localhost:5173'
        'Access-Control-Request-Method'  = 'POST'
        'Access-Control-Request-Headers' = 'content-type'
    }
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ocr" -Method OPTIONS -Headers $headers -TimeoutSec 10
    Write-Host "✅ CORS preflight OK (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Vérifier les headers CORS dans la réponse
    $corsHeaders = $response.Headers | Where-Object { $_.Key -like "*Access-Control*" }
    if ($corsHeaders) {
        Write-Host "📋 Headers CORS retournés:" -ForegroundColor Cyan
        foreach ($header in $corsHeaders) {
            Write-Host "  $($header.Key): $($header.Value)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "⚠️ Aucun header CORS trouvé dans la réponse" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Test CORS preflight échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test endpoint simple
Write-Host "`n4. Test endpoint documents/ping..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ping" -Method GET -TimeoutSec 10
    Write-Host "✅ Endpoint ping OK: $($response.Content)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Endpoint ping échoué: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Diagnostic terminé!" -ForegroundColor Cyan
