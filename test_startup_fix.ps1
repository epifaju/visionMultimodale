# Script de test pour vérifier que l'application démarre correctement après les corrections

Write-Host "🧪 Test de démarrage de l'application après correction..." -ForegroundColor Green

# Aller dans le répertoire backend
Set-Location backend

Write-Host "📁 Répertoire de travail: $(Get-Location)" -ForegroundColor Cyan

# Nettoyer et compiler
Write-Host "🧹 Nettoyage et compilation..." -ForegroundColor Yellow
mvn clean compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de compilation" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Compilation réussie" -ForegroundColor Green

# Tester le démarrage de l'application
Write-Host "🚀 Test de démarrage de l'application..." -ForegroundColor Yellow

# Démarrer l'application en arrière-plan
$process = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -PassThru -NoNewWindow

# Attendre un peu pour que l'application démarre
Start-Sleep -Seconds 10

# Vérifier si l'application est en cours d'exécution
if (-not $process.HasExited) {
    Write-Host "✅ Application démarrée avec succès!" -ForegroundColor Green
    
    # Tester l'endpoint de santé
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Endpoint de santé accessible" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Endpoint de santé non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Arrêter l'application
    Write-Host "🛑 Arrêt de l'application..." -ForegroundColor Yellow
    $process.Kill()
    $process.WaitForExit(5000)
    
    if ($process.HasExited) {
        Write-Host "✅ Application arrêtée proprement" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Application n'a pas pu être arrêtée proprement" -ForegroundColor Yellow
        $process.Kill($true)
    }
    
} else {
    Write-Host "❌ Application n'a pas pu démarrer (code de sortie: $($process.ExitCode))" -ForegroundColor Red
    
    # Afficher les logs d'erreur
    Write-Host "📋 Logs d'erreur:" -ForegroundColor Yellow
    Get-Content -Path "target\spring-boot-application.log" -Tail 20 -ErrorAction SilentlyContinue
}

Write-Host "`n🎯 Test terminé!" -ForegroundColor Green
