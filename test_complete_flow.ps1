# Test complet du flux d'upload et récupération
Write-Host "Test complet du flux d'upload et recuperation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Connexion
Write-Host "`n1. Connexion avec admin..." -ForegroundColor Yellow
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Connexion reussie! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Créer un fichier de test
Write-Host "`n2. Creation du fichier de test..." -ForegroundColor Yellow
$testFile = "test_document.txt"
"Contenu de test pour l'upload" | Out-File -FilePath $testFile -Encoding UTF8
Write-Host "Fichier cree: $testFile" -ForegroundColor Green

# 3. Upload avec authentification
Write-Host "`n3. Upload du document avec authentification..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data"
}

try {
    # Utiliser curl pour l'upload avec authentification
    $curlCommand = "curl -X POST -H `"Authorization: Bearer $token`" -F `"file=@$testFile`" http://localhost:8080/api/documents/test-upload"
    Write-Host "Commande curl: $curlCommand" -ForegroundColor Gray
    Invoke-Expression $curlCommand
    Write-Host "Upload termine" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de l'upload: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Récupération des documents
Write-Host "`n4. Recuperation des documents..." -ForegroundColor Yellow
$docHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers $docHeaders
    Write-Host "Recuperation reussie!" -ForegroundColor Green
    Write-Host "   Nombre de documents: $($documentsResponse.totalElements)" -ForegroundColor Gray
    Write-Host "   Pages totales: $($documentsResponse.totalPages)" -ForegroundColor Gray
    
    if ($documentsResponse.content.Count -gt 0) {
        Write-Host "`nDocuments trouves:" -ForegroundColor Green
        foreach ($doc in $documentsResponse.content) {
            Write-Host "   - ID: $($doc.id), Nom: $($doc.fileName), Taille: $($doc.fileSize) bytes" -ForegroundColor White
        }
    } else {
        Write-Host "   Aucun document trouve" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de la recuperation: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Nettoyage
Write-Host "`n5. Nettoyage..." -ForegroundColor Yellow
if (Test-Path $testFile) {
    Remove-Item $testFile -Force
    Write-Host "Fichier de test supprime" -ForegroundColor Green
}

Write-Host "`nTest complet termine!" -ForegroundColor Cyan



