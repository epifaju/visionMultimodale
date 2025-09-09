# Script d'initialisation automatique des utilisateurs par défaut
Write-Host "Initialisation des utilisateurs par defaut" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Vérifier que le backend est démarré
Write-Host "`n1. Verification du backend..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0

do {
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET -TimeoutSec 5
        Write-Host "Backend accessible" -ForegroundColor Green
        $backendReady = $true
        break
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "Backend non accessible, tentative $retryCount/$maxRetries..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        } else {
            Write-Host "Backend non accessible apres $maxRetries tentatives. Demarrez-le avec: cd backend; mvn spring-boot:run" -ForegroundColor Red
            exit 1
        }
    }
} while ($retryCount -lt $maxRetries)

# 2. Vérifier si l'utilisateur admin existe déjà
Write-Host "`n2. Verification de l'utilisateur admin..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/test-users" -Method GET
    $adminExists = $false
    
    if ($usersResponse.count -gt 0) {
        foreach ($user in $usersResponse.users) {
            if ($user.username -eq "admin") {
                $adminExists = $true
                Write-Host "Utilisateur admin deja existant" -ForegroundColor Green
                Write-Host "   Username: $($user.username)" -ForegroundColor Gray
                Write-Host "   Email: $($user.email)" -ForegroundColor Gray
                Write-Host "   Role: $($user.role)" -ForegroundColor Gray
                break
            }
        }
    }
    
    if (-not $adminExists) {
        Write-Host "Utilisateur admin non trouve, creation en cours..." -ForegroundColor Yellow
        
        # 3. Créer l'utilisateur admin
        $userData = @{
            username = "admin"
            email = "admin@example.com"
            password = "admin123"
            firstName = "Admin"
            lastName = "User"
            role = "ADMIN"
        } | ConvertTo-Json

        Write-Host "Donnees a envoyer:" -ForegroundColor Gray
        Write-Host $userData -ForegroundColor Gray

        try {
            $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
            Write-Host "Utilisateur admin cree avec succes!" -ForegroundColor Green
            Write-Host "   Username: $($registerResponse.user.username)" -ForegroundColor Gray
            Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
            Write-Host "   ID: $($registerResponse.user.id)" -ForegroundColor Gray
            Write-Host "   Role: $($registerResponse.user.role)" -ForegroundColor Gray
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
    }
} catch {
    Write-Host "Erreur lors de la verification des utilisateurs: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test de connexion
Write-Host "`n3. Test de connexion..." -ForegroundColor Yellow
try {
    $loginData = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Connexion reussie!" -ForegroundColor Green
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "   User: $($loginResponse.user.username)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors du test de connexion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nInitialisation terminee!" -ForegroundColor Cyan
Write-Host "Vous pouvez maintenant vous connecter avec:" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray