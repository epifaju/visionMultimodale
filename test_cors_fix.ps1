# Test de la correction CORS
Write-Host "🔧 Test de la correction CORS..." -ForegroundColor Yellow

# Test 1: Vérifier que le backend répond
Write-Host "`n1. Test de connectivité backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ Backend accessible: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test de login avec CORS
Write-Host "`n2. Test de login avec CORS..." -ForegroundColor Cyan
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "✅ Login réussi: Token reçu" -ForegroundColor Green
    Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login échoué: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Code d'erreur: $statusCode" -ForegroundColor Red
    }
}

# Test 3: Test CORS avec OPTIONS
Write-Host "`n3. Test CORS preflight (OPTIONS)..." -ForegroundColor Cyan
try {
    $headers = @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method OPTIONS -Headers $headers
    Write-Host "✅ CORS preflight réussi: $($response.StatusCode)" -ForegroundColor Green
    
    # Vérifier les headers CORS
    $corsHeaders = @()
    if ($response.Headers["Access-Control-Allow-Origin"]) { $corsHeaders += "Allow-Origin" }
    if ($response.Headers["Access-Control-Allow-Methods"]) { $corsHeaders += "Allow-Methods" }
    if ($response.Headers["Access-Control-Allow-Headers"]) { $corsHeaders += "Allow-Headers" }
    if ($response.Headers["Access-Control-Allow-Credentials"]) { $corsHeaders += "Allow-Credentials" }
    
    Write-Host "   Headers CORS presents: $($corsHeaders -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "❌ CORS preflight échoué: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test terminé!" -ForegroundColor Yellow