# Script pour créer l'utilisateur admin
Write-Host "Creation de l'utilisateur admin" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# 1. Vérifier que le backend est démarré
Write-Host "`n1. Verification du backend..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "Backend non accessible. Demarrez-le avec: cd backend; mvn spring-boot:run" -ForegroundColor Red
    exit 1
}

# 2. Créer l'utilisateur admin
Write-Host "`n2. Creation de l'utilisateur admin..." -ForegroundColor Yellow
$userData = @{
    username = "admin"
    email = "admin@example.com"
    password = "admin123"
    firstName = "Admin"
    lastName = "User"
} | ConvertTo-Json

Write-Host "Donnees a envoyer:" -ForegroundColor Gray
Write-Host $userData -ForegroundColor Gray

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "Utilisateur admin cree avec succes!" -ForegroundColor Green
    Write-Host "   Username: $($registerResponse.user.username)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host "   ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de la creation de l'utilisateur:" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red
    
    # Essayer de récupérer le message d'erreur détaillé
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Details: $errorBody" -ForegroundColor Red
    }
}

# 3. Vérifier que l'utilisateur a été créé
Write-Host "`n3. Verification de la creation..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/test-users" -Method GET
    Write-Host "Nombre d'utilisateurs: $($usersResponse.count)" -ForegroundColor Green
    
    if ($usersResponse.count -gt 0) {
        Write-Host "Utilisateurs trouves:" -ForegroundColor Green
        foreach ($user in $usersResponse.users) {
            Write-Host "   - $($user.username) ($($user.email))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Erreur lors de la verification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nCreation de l'utilisateur admin terminee!" -ForegroundColor Cyan



