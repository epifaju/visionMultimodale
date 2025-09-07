# Script de test pour l'intégration frontend-backend
# Ce script teste l'application complète avec tous les nouveaux composants

Write-Host "🚀 Test d'intégration Frontend-Backend - Vision Multimodale" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

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
        [int]$TimeoutSeconds = 30
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
Write-Host "🐳 Démarrage de PostgreSQL..." -ForegroundColor Yellow

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

# Étape 5: Compiler et démarrer l'application React
Write-Host "`n📋 ÉTAPE 5: Compilation et démarrage de l'application React" -ForegroundColor Magenta

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

# Étape 6: Tester les endpoints API
Write-Host "`n📋 ÉTAPE 6: Test des endpoints API" -ForegroundColor Magenta

$baseUrl = "http://localhost:8080/api"
$headers = @{
    "Content-Type" = "application/json"
}

# Test de l'endpoint de statut
Write-Host "🧪 Test de l'endpoint de statut..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/documents/status" -Method GET -Headers $headers
    Write-Host "✅ Statut des services récupéré avec succès" -ForegroundColor Green
    Write-Host "   Services disponibles: $($response.services | ConvertTo-Json -Compress)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erreur lors du test de l'endpoint de statut: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'endpoint de test simple
Write-Host "🧪 Test de l'endpoint de test simple..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/documents/test" -Method GET -Headers $headers
    Write-Host "✅ Endpoint de test fonctionne" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors du test de l'endpoint simple: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'authentification
Write-Host "🧪 Test de l'authentification..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
    Write-Host "✅ Authentification réussie" -ForegroundColor Green
    Write-Host "   Token reçu: $($response.token.Substring(0, 20))..." -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erreur lors de l'authentification: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 7: Afficher les URLs d'accès
Write-Host "`n📋 ÉTAPE 7: URLs d'accès" -ForegroundColor Magenta
Write-Host "🌐 Application React: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 API Backend: http://localhost:8080/api" -ForegroundColor Cyan
Write-Host "📊 Statut des services: http://localhost:8080/api/documents/status" -ForegroundColor Cyan
Write-Host "🔍 Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "📄 Page de traitement: http://localhost:5173/processing" -ForegroundColor Cyan

# Étape 8: Instructions de test manuel
Write-Host "`n📋 ÉTAPE 8: Instructions de test manuel" -ForegroundColor Magenta
Write-Host "🧪 Tests à effectuer manuellement:" -ForegroundColor Yellow
Write-Host "   1. Ouvrir http://localhost:5173 dans votre navigateur" -ForegroundColor Gray
Write-Host "   2. Se connecter avec admin/password" -ForegroundColor Gray
Write-Host "   3. Aller sur la page 'Traitement' (http://localhost:5173/processing)" -ForegroundColor Gray
Write-Host "   4. Tester l'upload d'une image et l'extraction OCR" -ForegroundColor Gray
Write-Host "   5. Tester l'upload d'un PDF et l'extraction de texte" -ForegroundColor Gray
Write-Host "   6. Tester la lecture de codes-barres" -ForegroundColor Gray
Write-Host "   7. Tester l'extraction MRZ avec une image de document d'identité" -ForegroundColor Gray
Write-Host "   8. Tester l'analyse IA avec Ollama" -ForegroundColor Gray

# Étape 9: Instructions pour arrêter les services
Write-Host "`n📋 ÉTAPE 9: Instructions d'arrêt" -ForegroundColor Magenta
Write-Host "🛑 Pour arrêter les services:" -ForegroundColor Yellow
Write-Host "   - Appuyez sur Ctrl+C dans cette fenêtre" -ForegroundColor Gray
Write-Host "   - Ou exécutez: docker-compose down" -ForegroundColor Gray
Write-Host "   - Ou fermez les fenêtres des applications" -ForegroundColor Gray

Write-Host "`n🎉 Intégration Frontend-Backend démarrée avec succès !" -ForegroundColor Green
Write-Host "🚀 Vous pouvez maintenant tester l'application complète via les URLs ci-dessus" -ForegroundColor Green

# Attendre une entrée utilisateur pour arrêter
Write-Host "`n⏸️ Appuyez sur une touche pour arrêter les services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Arrêter les services
Write-Host "`n🛑 Arrêt des services..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ Services arrêtés" -ForegroundColor Green
