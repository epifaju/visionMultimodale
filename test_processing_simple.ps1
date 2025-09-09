# Test simple de la page de traitement
Write-Host "Test de la page de traitement modifiee" -ForegroundColor Cyan

# 1. Vérifier backend
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "Backend non accessible" -ForegroundColor Red
    exit 1
}

# 2. Vérifier frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "Frontend non accessible" -ForegroundColor Red
    exit 1
}

# 3. Vérifier documents
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.token

$documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers @{"Authorization"="Bearer $token"}
Write-Host "Documents en base: $($documentsResponse.totalElements)" -ForegroundColor Green

Write-Host "`nInstructions:" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:5173" -ForegroundColor White
Write-Host "2. Connectez-vous avec admin/admin123" -ForegroundColor White
Write-Host "3. Allez dans 'Traitement de Documents'" -ForegroundColor White
Write-Host "4. Cliquez sur l'onglet 'Document uploadé'" -ForegroundColor White
Write-Host "5. Vous devriez voir vos documents uploadés" -ForegroundColor White

Write-Host "`nTest termine!" -ForegroundColor Green



