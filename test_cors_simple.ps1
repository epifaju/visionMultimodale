# Test de la correction CORS
Write-Host "Test de la correction CORS..." -ForegroundColor Yellow

# Test 1: Verifier que le backend repond
Write-Host "`n1. Test de connectivite backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "Backend accessible: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "Login reussi: Token recu" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "Login echoue: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Code d'erreur: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`nTest termine!" -ForegroundColor Yellow


