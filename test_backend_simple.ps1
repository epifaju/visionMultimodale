# Script simple pour tester le backend
Write-Host "🔍 Test simple du backend" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Test health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ Health check OK" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check échoué" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test endpoint documents
Write-Host "`n2. Test endpoint documents..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test" -Method GET
    Write-Host "✅ Documents test OK" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Documents test échoué" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test CORS
Write-Host "`n3. Test CORS..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/test" -Method GET -Headers @{
        "Origin" = "http://localhost:5173"
    }
    Write-Host "✅ CORS OK" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ CORS échoué" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

