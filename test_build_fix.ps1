# Script de test pour vérifier que le build Docker fonctionne
Write-Host "🔧 Test de correction du build Docker" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Arrêter les conteneurs existants
Write-Host "`n🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Nettoyer les images Docker
Write-Host "`n🧹 Nettoyage des images Docker..." -ForegroundColor Yellow
docker system prune -f

# Reconstruire et démarrer les services
Write-Host "`n🏗️ Reconstruction des services Docker..." -ForegroundColor Yellow
docker-compose up --build -d

# Attendre que les services soient prêts
Write-Host "`n⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier le statut des conteneurs
Write-Host "`n📊 Statut des conteneurs:" -ForegroundColor Cyan
docker-compose ps

# Tester l'API backend
Write-Host "`n🧪 Test de l'API backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/status" -Method GET -TimeoutSec 10
    Write-Host "✅ API Backend accessible" -ForegroundColor Green
    Write-Host "   Services disponibles: $($response.services.Keys -join ', ')" -ForegroundColor White
} catch {
    Write-Host "❌ API Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Tester le frontend
Write-Host "`n🧪 Test du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend non accessible - Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Afficher les logs en cas d'erreur
Write-Host "`n📋 Logs des services:" -ForegroundColor Cyan
Write-Host "Backend logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 backend

Write-Host "`nFrontend logs:" -ForegroundColor Yellow
docker-compose logs --tail=20 frontend

Write-Host "`n🏁 Test de build termine !" -ForegroundColor Green
Write-Host "Verifiez les logs ci-dessus pour identifier d'eventuels problemes." -ForegroundColor Cyan
