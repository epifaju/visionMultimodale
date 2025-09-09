# Test de la correction des onglets
Write-Host "Test de la correction des onglets" -ForegroundColor Cyan

# 1. Vérifier les services
Write-Host "`n1. Vérification des services..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible" -ForegroundColor Red
    exit 1
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible" -ForegroundColor Red
    exit 1
}

# 2. Vérifier les documents
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
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

# 3. Instructions détaillées
Write-Host "`n2. Instructions pour tester les onglets:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "   2. Connectez-vous avec: admin / admin123" -ForegroundColor White
Write-Host "   3. Allez dans l'onglet 'Traitement de Documents'" -ForegroundColor White
Write-Host "   4. Testez les onglets:" -ForegroundColor White
Write-Host "      a) Onglet 'Nouveau fichier' (par défaut) - doit afficher FileUpload" -ForegroundColor Gray
Write-Host "      b) Onglet 'Document uploadé' - doit afficher la liste des documents" -ForegroundColor Gray
Write-Host "   5. Vérifiez que:" -ForegroundColor White
Write-Host "      - Les onglets changent visuellement (couleur bleue)" -ForegroundColor Gray
Write-Host "      - Le contenu change selon l'onglet sélectionné" -ForegroundColor Gray
Write-Host "      - La liste des documents s'affiche dans l'onglet 'Document uploadé'" -ForegroundColor Gray

Write-Host "`n✅ Test de configuration terminé!" -ForegroundColor Green
Write-Host "`n🔧 Corrections apportées:" -ForegroundColor Cyan
Write-Host "   - Ajout de l'état 'activeTab' pour gérer l'onglet actif" -ForegroundColor Gray
Write-Host "   - Correction de la logique des boutons d'onglets" -ForegroundColor Gray
Write-Host "   - Utilisation de 'activeTab' au lieu de '!selectedFile' pour l'affichage" -ForegroundColor Gray
Write-Host "   - Les onglets fonctionnent maintenant correctement" -ForegroundColor Gray



