# Test d'upload avec authentification
Write-Host "Test d'upload avec authentification" -ForegroundColor Cyan

# 1. Connexion
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Connexion reussie! Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# 2. Créer un fichier de test
$testFile = "test_auth_upload.txt"
"Test d'upload avec authentification" | Out-File -FilePath $testFile -Encoding UTF8
Write-Host "Fichier cree: $testFile" -ForegroundColor Green

# 3. Upload avec authentification
Write-Host "Upload avec authentification..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    # Utiliser Invoke-WebRequest avec les bons paramètres
    $form = @{
        file = Get-Item $testFile
    }
    
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Form $form -Headers $headers
    Write-Host "Upload reussi!" -ForegroundColor Green
    Write-Host "   Document ID: $($uploadResponse.document.id)" -ForegroundColor Gray
    Write-Host "   Nom: $($uploadResponse.document.fileName)" -ForegroundColor Gray
    Write-Host "   Utilisateur ID: $($uploadResponse.document.uploadedById)" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de l'upload: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vérifier les documents
Write-Host "`nVerification des documents..." -ForegroundColor Yellow
$documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers $headers
Write-Host "Nombre de documents: $($documentsResponse.totalElements)" -ForegroundColor Green

if ($documentsResponse.content.Count -gt 0) {
    Write-Host "Documents trouves:" -ForegroundColor Green
    foreach ($doc in $documentsResponse.content) {
        Write-Host "   - ID: $($doc.id), Nom: $($doc.fileName), Utilisateur: $($doc.uploadedByUsername)" -ForegroundColor White
    }
} else {
    Write-Host "Aucun document trouve" -ForegroundColor Red
}

# 5. Nettoyage
Remove-Item $testFile -Force -ErrorAction SilentlyContinue
Write-Host "`nTest termine!" -ForegroundColor Cyan



