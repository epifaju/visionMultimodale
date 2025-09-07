# Script de redémarrage des services pour éviter les problèmes CORS
Write-Host "Redémarrage des services Vision Multimodale" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Arrêter tous les processus
Write-Host "`n1. Arrêt des processus existants..." -ForegroundColor Yellow

# Arrêter Node.js (frontend)
try {
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
    Write-Host "✅ Processus Node.js arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun processus Node.js en cours" -ForegroundColor Gray
}

# Arrêter Java (backend)
try {
    Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force
    Write-Host "✅ Processus Java arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun processus Java en cours" -ForegroundColor Gray
}

# Attendre un peu
Start-Sleep -Seconds 3

# 2. Démarrer le backend
Write-Host "`n2. Démarrage du backend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd backend && mvn spring-boot:run" -WindowStyle Minimized
Write-Host "✅ Backend en cours de démarrage..." -ForegroundColor Green

# Attendre que le backend soit prêt
Write-Host "   Attente du démarrage du backend (30 secondes)..." -ForegroundColor Gray
$backendReady = $false
$attempts = 0
while (-not $backendReady -and $attempts -lt 30) {
    Start-Sleep -Seconds 1
    $attempts++
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET -TimeoutSec 2
        $backendReady = $true
        Write-Host "✅ Backend prêt après $attempts secondes" -ForegroundColor Green
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host "`n❌ Le backend n'a pas démarré dans les temps" -ForegroundColor Red
    Write-Host "   Vérifiez les logs dans la fenêtre du backend" -ForegroundColor Gray
    exit 1
}

# 3. Démarrer le frontend
Write-Host "`n3. Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd frontend && npm run dev" -WindowStyle Minimized
Write-Host "✅ Frontend en cours de démarrage..." -ForegroundColor Green

# Attendre que le frontend soit prêt
Write-Host "   Attente du démarrage du frontend (15 secondes)..." -ForegroundColor Gray
$frontendReady = $false
$attempts = 0
while (-not $frontendReady -and $attempts -lt 15) {
    Start-Sleep -Seconds 1
    $attempts++
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 2
        $frontendReady = $true
        Write-Host "✅ Frontend prêt après $attempts secondes" -ForegroundColor Green
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $frontendReady) {
    Write-Host "`n❌ Le frontend n'a pas démarré dans les temps" -ForegroundColor Red
    Write-Host "   Vérifiez les logs dans la fenêtre du frontend" -ForegroundColor Gray
    exit 1
}

# 4. Test final
Write-Host "`n4. Test de connectivité..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=5" -Method GET
    Write-Host "✅ Test de connectivité réussi" -ForegroundColor Green
    Write-Host "   Documents en base: $($testResponse.totalElements)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test de connectivité échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Instructions
Write-Host "`n5. Services redémarrés avec succès!" -ForegroundColor Green
Write-Host "   Backend: http://localhost:8080" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "`n   Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   Connectez-vous avec: admin / admin123" -ForegroundColor White
Write-Host "   Les problèmes CORS devraient être résolus" -ForegroundColor White

Write-Host "`n✅ Redémarrage terminé!" -ForegroundColor Green
