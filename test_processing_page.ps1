# Test de la page de traitement modifiée
Write-Host "Test de la page de traitement modifiée" -ForegroundColor Cyan

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

# 2. Vérifier les documents en base
Write-Host "`n2. Vérification des documents en base..." -ForegroundColor Yellow
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    
    $documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Documents en base: $($documentsResponse.totalElements)" -ForegroundColor Green
    
    if ($documentsResponse.content.Count -gt 0) {
        Write-Host "   Documents trouvés:" -ForegroundColor Gray
        foreach ($doc in $documentsResponse.content) {
            Write-Host "     - $($doc.fileName) (ID: $($doc.id))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification des documents: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Instructions pour tester
Write-Host "`n3. Instructions pour tester la page de traitement:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Connectez-vous avec: admin / admin123" -ForegroundColor White
Write-Host "   3. Allez dans l'onglet 'Traitement de Documents'" -ForegroundColor White
Write-Host "   4. Vous devriez voir:" -ForegroundColor White
Write-Host "      - Un onglet 'Nouveau fichier' (comportement original)" -ForegroundColor Gray
Write-Host "      - Un onglet 'Document uploadé' (nouveau)" -ForegroundColor Gray
Write-Host "   5. Cliquez sur 'Document uploadé' pour voir la liste des documents" -ForegroundColor White
Write-Host "   6. Sélectionnez un document pour le traiter" -ForegroundColor White

Write-Host "`n✅ Test de configuration terminé!" -ForegroundColor Green
Write-Host "`n📋 Résumé des modifications apportées:" -ForegroundColor Cyan
Write-Host "   - Ajout de la récupération des documents uploadés" -ForegroundColor Gray
Write-Host "   - Interface avec onglets pour choisir entre fichier local ou document uploadé" -ForegroundColor Gray
Write-Host "   - Affichage de la liste des documents uploadés" -ForegroundColor Gray
Write-Host "   - Sélection et indication visuelle du document choisi" -ForegroundColor Gray
Write-Host "   - Message informatif pour le traitement des documents uploades" -ForegroundColor Gray
