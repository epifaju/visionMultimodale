# Script de démarrage et test de l'application Vision Multimodale
# Ce script démarre l'application et lance les tests

Write-Host "🚀 Démarrage et test de l'application Vision Multimodale" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Fonction pour vérifier si un port est ouvert
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Fonction pour attendre qu'un service soit disponible
function Wait-ForService {
    param(
        [string]$ServiceName,
        [int]$Port,
        [int]$TimeoutSeconds = 60
    )
    
    Write-Host "⏳ Attente du démarrage de $ServiceName sur le port $Port..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    while ((Get-Date) - $startTime -lt [TimeSpan]::FromSeconds($TimeoutSeconds)) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $ServiceName est disponible sur le port $Port" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ Timeout: $ServiceName n'est pas disponible après $TimeoutSeconds secondes" -ForegroundColor Red
    return $false
}

# Étape 1: Vérifier que Docker est en cours d'exécution
Write-Host "`n📋 ÉTAPE 1: Vérification de Docker" -ForegroundColor Magenta
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker disponible: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker n'est pas disponible. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Étape 2: Démarrer les services avec Docker Compose
Write-Host "`n📋 ÉTAPE 2: Démarrage des services Docker" -ForegroundColor Magenta
Write-Host "🐳 Démarrage de PostgreSQL et des services..." -ForegroundColor Yellow

try {
    # Arrêter les services existants s'ils tournent
    docker-compose down 2>$null
    
    # Démarrer les services
    docker-compose up -d
    
    Write-Host "✅ Services Docker démarrés" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors du démarrage des services Docker: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 3: Attendre que PostgreSQL soit disponible
Write-Host "`n📋 ÉTAPE 3: Attente de PostgreSQL" -ForegroundColor Magenta
if (-not (Wait-ForService -ServiceName "PostgreSQL" -Port 5432 -TimeoutSeconds 30)) {
    Write-Host "❌ PostgreSQL n'est pas disponible. Vérifiez les logs Docker." -ForegroundColor Red
    docker-compose logs postgres
    exit 1
}

# Étape 4: Compiler et démarrer l'application Spring Boot
Write-Host "`n📋 ÉTAPE 4: Compilation et démarrage de l'application Spring Boot" -ForegroundColor Magenta

# Aller dans le répertoire backend
Push-Location backend

try {
    # Compiler l'application
    Write-Host "🔨 Compilation de l'application Maven..." -ForegroundColor Yellow
    mvn clean compile -q
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur de compilation Maven" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Compilation réussie" -ForegroundColor Green
    
    # Démarrer l'application en arrière-plan
    Write-Host "🚀 Démarrage de l'application Spring Boot..." -ForegroundColor Yellow
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Hidden -PassThru | Out-Null
    
    # Attendre que l'application soit disponible
    if (-not (Wait-ForService -ServiceName "Spring Boot" -Port 8080 -TimeoutSeconds 60)) {
        Write-Host "❌ L'application Spring Boot n'est pas disponible. Vérifiez les logs." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Application Spring Boot démarrée" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors du démarrage de l'application: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

# Étape 5: Initialiser les utilisateurs par défaut
Write-Host "`n📋 ÉTAPE 5: Initialisation des utilisateurs par défaut" -ForegroundColor Magenta
Write-Host "👤 Initialisation de l'utilisateur admin..." -ForegroundColor Yellow

try {
    .\init_default_user.ps1
    Write-Host "✅ Utilisateurs initialisés" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'initialisation des utilisateurs: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️ Vous devrez créer manuellement l'utilisateur admin" -ForegroundColor Yellow
}

# Étape 6: Compiler et démarrer l'application React
Write-Host "`n📋 ÉTAPE 6: Compilation et démarrage de l'application React" -ForegroundColor Magenta

# Aller dans le répertoire frontend
Push-Location frontend

try {
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
        npm install
    }
    
    # Compiler l'application
    Write-Host "🔨 Compilation de l'application React..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur de compilation React" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Compilation React réussie" -ForegroundColor Green
    
    # Démarrer l'application en arrière-plan
    Write-Host "🚀 Démarrage de l'application React..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden -PassThru | Out-Null
    
    # Attendre que l'application soit disponible
    if (-not (Wait-ForService -ServiceName "React" -Port 5173 -TimeoutSeconds 30)) {
        Write-Host "❌ L'application React n'est pas disponible. Vérifiez les logs." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Application React démarrée" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors du démarrage de l'application React: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}

# Étape 7: Lancer les tests
Write-Host "`n📋 ÉTAPE 7: Lancement des tests" -ForegroundColor Magenta
Write-Host "🧪 Lancement des tests de l'API..." -ForegroundColor Yellow

try {
    # Lancer le script de test
    .\test_all_endpoints.ps1
}
catch {
    Write-Host "❌ Erreur lors des tests: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 8: Afficher les URLs d'accès
Write-Host "`n📋 ÉTAPE 8: URLs d'accès" -ForegroundColor Magenta
Write-Host "🌐 Application React: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 API Backend: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "📊 Statut des services: http://localhost:8080/api/documents/status" -ForegroundColor Cyan
Write-Host "🔍 Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan

# Étape 9: Instructions pour arrêter les services
Write-Host "`n📋 ÉTAPE 9: Instructions d'arrêt" -ForegroundColor Magenta
Write-Host "🛑 Pour arrêter les services:" -ForegroundColor Yellow
Write-Host "   - Appuyez sur Ctrl+C dans cette fenêtre" -ForegroundColor Gray
Write-Host "   - Ou exécutez: docker-compose down" -ForegroundColor Gray
Write-Host "   - Ou fermez les fenêtres des applications" -ForegroundColor Gray

Write-Host "`n🎉 Application Vision Multimodale démarrée avec succès !" -ForegroundColor Green
Write-Host "🚀 Vous pouvez maintenant utiliser l'application via les URLs ci-dessus" -ForegroundColor Green

# Attendre une entrée utilisateur pour arrêter
Write-Host "`n⏸️ Appuyez sur une touche pour arrêter les services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Arrêter les services
Write-Host "`n🛑 Arrêt des services..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ Services arrêtés" -ForegroundColor Green
