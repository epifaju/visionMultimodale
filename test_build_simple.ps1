# Script de test simple pour le build Docker
Write-Host "Test de correction du build Docker" -ForegroundColor Green

# Arreter les conteneurs existants
Write-Host "Arret des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Nettoyer les images Docker
Write-Host "Nettoyage des images Docker..." -ForegroundColor Yellow
docker system prune -f

# Reconstruire et demarrer les services
Write-Host "Reconstruction des services Docker..." -ForegroundColor Yellow
docker-compose up --build -d

# Attendre que les services soient prets
Write-Host "Attente du demarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verifier le statut des conteneurs
Write-Host "Statut des conteneurs:" -ForegroundColor Cyan
docker-compose ps

# Tester l'API backend
Write-Host "Test de l'API backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/status" -Method GET -TimeoutSec 10
    Write-Host "API Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "API Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Tester le frontend
Write-Host "Test du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend accessible" -ForegroundColor Green
    } else {
        Write-Host "Frontend non accessible - Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test de build termine !" -ForegroundColor Green
