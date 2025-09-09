# Test du flux complet frontend
Write-Host "Test du flux complet frontend" -ForegroundColor Cyan

# 1. Vérifier que les services sont démarrés
Write-Host "`n1. Vérification des services..." -ForegroundColor Yellow

# Backend
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible" -ForegroundColor Red
    exit 1
}

# Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible. Démarrez avec: cd frontend && npm run dev" -ForegroundColor Red
    exit 1
}

# 2. Test de connexion
Write-Host "`n2. Test de connexion..." -ForegroundColor Yellow
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Vérifier les documents existants
Write-Host "`n3. Vérification des documents existants..." -ForegroundColor Yellow
try {
    $documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Documents récupérés: $($documentsResponse.totalElements) documents" -ForegroundColor Green
    if ($documentsResponse.content.Count -gt 0) {
        Write-Host "   Documents trouvés:" -ForegroundColor Gray
        foreach ($doc in $documentsResponse.content) {
            Write-Host "     - $($doc.fileName) (ID: $($doc.id))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération des documents: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Instructions pour l'utilisateur
Write-Host "`n4. Instructions pour tester le frontend:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Connectez-vous avec: admin / admin123" -ForegroundColor White
Write-Host "   3. Allez dans l'onglet 'Upload' et uploadez un fichier" -ForegroundColor White
Write-Host "   4. Allez dans l'onglet 'Documents' pour voir les documents" -ForegroundColor White
Write-Host "   5. Vérifiez la console du navigateur pour les logs" -ForegroundColor White

Write-Host "`n✅ Test de configuration terminé!" -ForegroundColor Green



