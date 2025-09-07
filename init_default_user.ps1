# Script pour créer un utilisateur par défaut
Write-Host "Creation d'un utilisateur par defaut" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Vérifier que le backend est démarré
Write-Host "`n1. Verification du backend..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "Backend non accessible. Demarrez-le avec: cd backend; mvn spring-boot:run" -ForegroundColor Red
    exit 1
}

# 2. Créer un utilisateur par défaut via l'API d'inscription
Write-Host "`n2. Creation de l'utilisateur par defaut..." -ForegroundColor Yellow
$userData = @{
    username = "admin"
    email = "admin@example.com"
    password = "admin123"
    firstName = "Admin"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "Utilisateur cree avec succes!" -ForegroundColor Green
    Write-Host "   Username: $($registerResponse.user.username)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host "   ID: $($registerResponse.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de la creation de l'utilisateur:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    # Si l'utilisateur existe déjà, c'est OK
    if ($_.Exception.Message -like "*already exists*" -or $_.Exception.Message -like "*deja*") {
        Write-Host "   L'utilisateur existe deja, c'est OK!" -ForegroundColor Yellow
    }
}

Write-Host "`nUtilisateur par defaut initialise!" -ForegroundColor Cyan
