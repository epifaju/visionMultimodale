# Script de test pour l'API d'authentification
Write-Host "Test de l'API d'authentification..." -ForegroundColor Green

# Attendre que le serveur démarre
Start-Sleep -Seconds 10

# Test de connexion
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    Write-Host "Token: $($response.token)" -ForegroundColor Yellow
    Write-Host "Utilisateur: $($response.user.username)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Erreur de connexion:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# Test de santé de l'API
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ API Health Check: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Health Check failed: $($_.Exception.Message)" -ForegroundColor Red
}

