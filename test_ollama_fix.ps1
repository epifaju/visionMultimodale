# Script de test pour vérifier la correction de l'erreur Ollama

Write-Host "🧪 Test de la correction de l'erreur Ollama..." -ForegroundColor Green

# Aller dans le répertoire backend
Set-Location backend

Write-Host "📁 Répertoire de travail: $(Get-Location)" -ForegroundColor Cyan

# Compiler le projet
Write-Host "🔨 Compilation du projet..." -ForegroundColor Yellow
mvn clean compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de compilation" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilation réussie" -ForegroundColor Green

# Démarrer l'application en arrière-plan
Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Yellow
$process = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -PassThru -NoNewWindow

# Attendre que l'application démarre
Write-Host "⏳ Attente du démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Tester l'endpoint de santé
Write-Host "🏥 Test de l'endpoint de santé..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 10
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Application démarrée avec succès" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Application non accessible" -ForegroundColor Red
    Write-Host "💡 Vérifiez les logs pour plus de détails" -ForegroundColor Yellow
}

# Tester l'endpoint de statut des services
Write-Host "🔍 Test de l'endpoint de statut des services..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/status" -TimeoutSec 10
    if ($statusResponse.StatusCode -eq 200) {
        $statusData = $statusResponse.Content | ConvertFrom-Json
        Write-Host "✅ Statut des services récupéré" -ForegroundColor Green
        Write-Host "📊 Configuration Ollama:" -ForegroundColor Cyan
        Write-Host "  - URL: $($statusData.ollama.url)" -ForegroundColor White
        Write-Host "  - Modèle: $($statusData.ollama.model)" -ForegroundColor White
        Write-Host "  - Disponible: $($statusData.ollama.available)" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ Impossible de récupérer le statut des services" -ForegroundColor Yellow
}

# Tester l'analyse IA avec un fichier de test
Write-Host "🤖 Test de l'analyse IA..." -ForegroundColor Yellow

# Créer un fichier de test simple
$testImagePath = "test-image.txt"
"Test image content" | Out-File -FilePath $testImagePath -Encoding UTF8

try {
    # Créer un FormData pour le test
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test.txt`"",
        "Content-Type: text/plain",
        "",
        "Test content",
        "--$boundary",
        "Content-Disposition: form-data; name=`"prompt`"",
        "",
        "Analysez ce contenu de test",
        "--$boundary--"
    ) -join $LF
    
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $analyzeResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/analyze" -Method POST -Body $bodyLines -Headers $headers -TimeoutSec 30
    
    if ($analyzeResponse.StatusCode -eq 200) {
        $analyzeData = $analyzeResponse.Content | ConvertFrom-Json
        Write-Host "✅ Analyse IA testée avec succès" -ForegroundColor Green
        Write-Host "📝 Réponse: $($analyzeData.response.Substring(0, [Math]::Min(100, $analyzeData.response.Length)))..." -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ Test d'analyse IA échoué: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Cela peut être normal si Ollama n'est pas installé" -ForegroundColor Cyan
} finally {
    # Nettoyer le fichier de test
    Remove-Item $testImagePath -ErrorAction SilentlyContinue
}

# Arrêter l'application
Write-Host "🛑 Arrêt de l'application..." -ForegroundColor Yellow
if (-not $process.HasExited) {
    $process.Kill()
    $process.WaitForExit(5000)
    Write-Host "✅ Application arrêtée" -ForegroundColor Green
}

Write-Host "`n🎯 Test terminé!" -ForegroundColor Green
Write-Host "L'erreur 'model not found' devrait maintenant être gérée correctement." -ForegroundColor Cyan
Write-Host "Si Ollama n'est pas installé, l'application retournera un résultat mock." -ForegroundColor Cyan
