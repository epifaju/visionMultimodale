# Script d'optimisation des performances pour Vision Multimodale
# Ce script analyse et optimise les performances de l'application

Write-Host "⚡ Optimisation des performances - Vision Multimodale" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:8080/api"
$frontendUrl = "http://localhost:5173"
$performanceResults = @()

# Fonction pour mesurer le temps de réponse
function Measure-ResponseTime {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $startTime = Get-Date
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body $Body -ContentType "application/json"
        }
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        return @{
            Success = $true
            ResponseTime = $responseTime
            StatusCode = 200
        }
    }
    catch {
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        return @{
            Success = $false
            ResponseTime = $responseTime
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
    }
}

# Fonction pour tester la charge
function Test-Load {
    param(
        [string]$Url,
        [int]$ConcurrentRequests = 10,
        [int]$TotalRequests = 100
    )
    
    Write-Host "🧪 Test de charge: $TotalRequests requêtes avec $ConcurrentRequests en parallèle" -ForegroundColor Yellow
    
    $jobs = @()
    $results = @()
    
    for ($i = 0; $i -lt $TotalRequests; $i++) {
        $job = Start-Job -ScriptBlock {
            param($url)
            $startTime = Get-Date
            try {
                $response = Invoke-RestMethod -Uri $url -Method GET
                $endTime = Get-Date
                $responseTime = ($endTime - $startTime).TotalMilliseconds
                return @{
                    Success = $true
                    ResponseTime = $responseTime
                    Timestamp = $startTime
                }
            }
            catch {
                $endTime = Get-Date
                $responseTime = ($endTime - $startTime).TotalMilliseconds
                return @{
                    Success = $false
                    ResponseTime = $responseTime
                    Error = $_.Exception.Message
                    Timestamp = $startTime
                }
            }
        } -ArgumentList $Url
        
        $jobs += $job
        
        # Limiter le nombre de jobs concurrents
        if ($jobs.Count -ge $ConcurrentRequests) {
            $completedJob = $jobs | Wait-Job -Any
            $result = Receive-Job -Job $completedJob
            $results += $result
            Remove-Job -Job $completedJob
            $jobs = $jobs | Where-Object { $_.State -eq "Running" }
        }
    }
    
    # Attendre la fin de tous les jobs restants
    $jobs | Wait-Job | ForEach-Object {
        $result = Receive-Job -Job $_
        $results += $result
        Remove-Job -Job $_
    }
    
    return $results
}

# Test 1: Performance de l'API de statut
Write-Host "`n📊 Test 1: Performance API de statut" -ForegroundColor Magenta
$statusTest = Measure-ResponseTime -Url "$baseUrl/documents/status"
$performanceResults += @{
    Test = "API Status"
    ResponseTime = $statusTest.ResponseTime
    Success = $statusTest.Success
}

if ($statusTest.Success) {
    Write-Host "✅ API Status: $([math]::Round($statusTest.ResponseTime, 2))ms" -ForegroundColor Green
} else {
    Write-Host "❌ API Status: Échec - $($statusTest.Error)" -ForegroundColor Red
}

# Test 2: Performance d'authentification
Write-Host "`n📊 Test 2: Performance d'authentification" -ForegroundColor Magenta
$loginData = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

$authTest = Measure-ResponseTime -Url "$baseUrl/auth/login" -Method "POST" -Body $loginData
$performanceResults += @{
    Test = "Authentication"
    ResponseTime = $authTest.ResponseTime
    Success = $authTest.Success
}

if ($authTest.Success) {
    Write-Host "✅ Authentification: $([math]::Round($authTest.ResponseTime, 2))ms" -ForegroundColor Green
    $global:authToken = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json").token
} else {
    Write-Host "❌ Authentification: Échec - $($authTest.Error)" -ForegroundColor Red
}

# Test 3: Test de charge sur l'API de statut
Write-Host "`n📊 Test 3: Test de charge sur l'API de statut" -ForegroundColor Magenta
$loadTestResults = Test-Load -Url "$baseUrl/documents/status" -ConcurrentRequests 5 -TotalRequests 20

$successfulRequests = $loadTestResults | Where-Object { $_.Success }
$failedRequests = $loadTestResults | Where-Object { -not $_.Success }
$avgResponseTime = if ($successfulRequests.Count -gt 0) { 
    ($successfulRequests | Measure-Object -Property ResponseTime -Average).Average 
} else { 0 }
$maxResponseTime = if ($successfulRequests.Count -gt 0) { 
    ($successfulRequests | Measure-Object -Property ResponseTime -Maximum).Maximum 
} else { 0 }
$minResponseTime = if ($successfulRequests.Count -gt 0) { 
    ($successfulRequests | Measure-Object -Property ResponseTime -Minimum).Minimum 
} else { 0 }

Write-Host "📈 Résultats du test de charge:" -ForegroundColor Cyan
Write-Host "   Requêtes réussies: $($successfulRequests.Count)/$($loadTestResults.Count)" -ForegroundColor Green
Write-Host "   Temps de réponse moyen: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor White
Write-Host "   Temps de réponse max: $([math]::Round($maxResponseTime, 2))ms" -ForegroundColor White
Write-Host "   Temps de réponse min: $([math]::Round($minResponseTime, 2))ms" -ForegroundColor White

$performanceResults += @{
    Test = "Load Test"
    AvgResponseTime = $avgResponseTime
    MaxResponseTime = $maxResponseTime
    MinResponseTime = $minResponseTime
    SuccessRate = [math]::Round(($successfulRequests.Count / $loadTestResults.Count) * 100, 2)
}

# Test 4: Performance du frontend
Write-Host "`n📊 Test 4: Performance du frontend" -ForegroundColor Magenta
$frontendTest = Measure-ResponseTime -Url $frontendUrl
$performanceResults += @{
    Test = "Frontend"
    ResponseTime = $frontendTest.ResponseTime
    Success = $frontendTest.Success
}

if ($frontendTest.Success) {
    Write-Host "✅ Frontend: $([math]::Round($frontendTest.ResponseTime, 2))ms" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: Échec - $($frontendTest.Error)" -ForegroundColor Red
}

# Test 5: Performance des services de traitement (si authentifié)
if ($global:authToken) {
    Write-Host "`n📊 Test 5: Performance des services de traitement" -ForegroundColor Magenta
    
    # Test OCR
    $ocrTest = Measure-ResponseTime -Url "$baseUrl/documents/test" -Headers @{ "Authorization" = "Bearer $global:authToken" }
    Write-Host "   OCR Test: $([math]::Round($ocrTest.ResponseTime, 2))ms" -ForegroundColor $(if ($ocrTest.Success) { "Green" } else { "Red" })
    
    # Test PDF
    $pdfTest = Measure-ResponseTime -Url "$baseUrl/documents/test" -Headers @{ "Authorization" = "Bearer $global:authToken" }
    Write-Host "   PDF Test: $([math]::Round($pdfTest.ResponseTime, 2))ms" -ForegroundColor $(if ($pdfTest.Success) { "Green" } else { "Red" })
    
    # Test Barcode
    $barcodeTest = Measure-ResponseTime -Url "$baseUrl/documents/test" -Headers @{ "Authorization" = "Bearer $global:authToken" }
    Write-Host "   Barcode Test: $([math]::Round($barcodeTest.ResponseTime, 2))ms" -ForegroundColor $(if ($barcodeTest.Success) { "Green" } else { "Red" })
    
    # Test MRZ
    $mrzTest = Measure-ResponseTime -Url "$baseUrl/documents/test" -Headers @{ "Authorization" = "Bearer $global:authToken" }
    Write-Host "   MRZ Test: $([math]::Round($mrzTest.ResponseTime, 2))ms" -ForegroundColor $(if ($mrzTest.Success) { "Green" } else { "Red" })
    
    # Test Ollama
    $ollamaTest = Measure-ResponseTime -Url "$baseUrl/documents/test" -Headers @{ "Authorization" = "Bearer $global:authToken" }
    Write-Host "   Ollama Test: $([math]::Round($ollamaTest.ResponseTime, 2))ms" -ForegroundColor $(if ($ollamaTest.Success) { "Green" } else { "Red" })
}

# Analyse des performances et recommandations
Write-Host "`n📈 ANALYSE DES PERFORMANCES" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta

$avgApiTime = ($performanceResults | Where-Object { $_.Test -eq "API Status" -or $_.Test -eq "Authentication" } | Measure-Object -Property ResponseTime -Average).Average
$avgFrontendTime = ($performanceResults | Where-Object { $_.Test -eq "Frontend" } | Measure-Object -Property ResponseTime -Average).Average

Write-Host "`n📊 Résumé des performances:" -ForegroundColor Cyan
Write-Host "   API Backend moyen: $([math]::Round($avgApiTime, 2))ms" -ForegroundColor White
Write-Host "   Frontend moyen: $([math]::Round($avgFrontendTime, 2))ms" -ForegroundColor White

# Recommandations d'optimisation
Write-Host "`n💡 Recommandations d'optimisation:" -ForegroundColor Yellow

if ($avgApiTime -gt 1000) {
    Write-Host "   ⚠️ API Backend lente (>1s):" -ForegroundColor Red
    Write-Host "      - Vérifiez la configuration de la base de données" -ForegroundColor Gray
    Write-Host "      - Optimisez les requêtes SQL" -ForegroundColor Gray
    Write-Host "      - Augmentez la mémoire allouée à l'application" -ForegroundColor Gray
    Write-Host "      - Utilisez un cache Redis" -ForegroundColor Gray
}

if ($avgFrontendTime -gt 2000) {
    Write-Host "   ⚠️ Frontend lent (>2s):" -ForegroundColor Red
    Write-Host "      - Optimisez les bundles JavaScript" -ForegroundColor Gray
    Write-Host "      - Utilisez le lazy loading" -ForegroundColor Gray
    Write-Host "      - Compressez les assets" -ForegroundColor Gray
    Write-Host "      - Utilisez un CDN" -ForegroundColor Gray
}

if ($avgApiTime -le 500 -and $avgFrontendTime -le 1000) {
    Write-Host "   ✅ Performances excellentes !" -ForegroundColor Green
    Write-Host "      - L'application répond dans des temps acceptables" -ForegroundColor Gray
    Write-Host "      - Aucune optimisation majeure nécessaire" -ForegroundColor Gray
}

# Recommandations générales
Write-Host "`n🔧 Optimisations recommandées:" -ForegroundColor Cyan
Write-Host "   1. Configuration de production:" -ForegroundColor White
Write-Host "      - Utilisez un serveur web (Nginx) comme reverse proxy" -ForegroundColor Gray
Write-Host "      - Configurez la compression gzip" -ForegroundColor Gray
Write-Host "      - Activez le cache HTTP" -ForegroundColor Gray

Write-Host "   2. Base de données:" -ForegroundColor White
Write-Host "      - Optimisez les index de la base de données" -ForegroundColor Gray
Write-Host "      - Configurez le connection pooling" -ForegroundColor Gray
Write-Host "      - Utilisez des requêtes préparées" -ForegroundColor Gray

Write-Host "   3. Application:" -ForegroundColor White
Write-Host "      - Activez la compression des réponses" -ForegroundColor Gray
Write-Host "      - Utilisez un cache en mémoire (Caffeine)" -ForegroundColor Gray
Write-Host "      - Optimisez les images et fichiers statiques" -ForegroundColor Gray

Write-Host "   4. Monitoring:" -ForegroundColor White
Write-Host "      - Implémentez des métriques de performance" -ForegroundColor Gray
Write-Host "      - Configurez des alertes de performance" -ForegroundColor Gray
Write-Host "      - Utilisez un APM (Application Performance Monitoring)" -ForegroundColor Gray

# Configuration d'optimisation automatique
Write-Host "`n⚙️ Configuration d'optimisation automatique:" -ForegroundColor Cyan

# Créer un fichier de configuration d'optimisation
$optimizationConfig = @"
# Configuration d'optimisation pour Vision Multimodale

## Backend (application.properties)
# Optimisation de la base de données
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# Compression des réponses
server.compression.enabled=true
server.compression.mime-types=text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
server.compression.min-response-size=1024

# Cache
spring.cache.type=caffeine
spring.cache.cache-names=documents,users,services
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=1h

# Logging
logging.level.org.springframework.web=WARN
logging.level.org.hibernate.SQL=WARN
logging.level.com.vision.app=INFO

## Frontend (vite.config.ts)
# Optimisation des bundles
build.rollupOptions.output.manualChunks = {
  vendor: ['react', 'react-dom'],
  ui: ['@headlessui/react', '@heroicons/react']
}

# Compression
build.rollupOptions.plugins.push(compression())

## Docker (docker-compose.yml)
# Ressources allouées
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
  
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
"@

$optimizationConfig | Out-File -FilePath "optimization_config.md" -Encoding UTF8
Write-Host "   📄 Configuration d'optimisation sauvegardée dans optimization_config.md" -ForegroundColor Green

Write-Host "`n🏁 Analyse de performance terminée !" -ForegroundColor Green
Write-Host "📊 Consultez le rapport ci-dessus pour les recommandations d'optimisation." -ForegroundColor Cyan
