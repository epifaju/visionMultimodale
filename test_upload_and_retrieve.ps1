# Script pour tester l'upload et la récupération des documents
Write-Host "Test d'upload et récupération de documents" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Vérifier que le backend est démarré
Write-Host "`n1. Vérification du backend..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "Backend non accessible. Demarrez-le avec: cd backend; mvn spring-boot:run" -ForegroundColor Red
    exit 1
}

# 2. Créer un fichier de test
Write-Host "`n2. Création du fichier de test..." -ForegroundColor Yellow
$testFile = "test_upload.txt"
$testContent = "Ceci est un document de test pour vérifier l'upload et la récupération."
$testContent | Out-File -FilePath $testFile -Encoding UTF8
Write-Host "Fichier cree: $testFile" -ForegroundColor Green

# 3. Tester l'upload
Write-Host "`n3. Test d'upload..." -ForegroundColor Yellow
try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Form @{file=Get-Item $testFile}
    Write-Host "Upload reussi!" -ForegroundColor Green
    Write-Host "   Document ID: $($uploadResponse.document.id)" -ForegroundColor Gray
    Write-Host "   Nom: $($uploadResponse.document.fileName)" -ForegroundColor Gray
    Write-Host "   Taille: $($uploadResponse.document.fileSize) bytes" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de l'upload:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Details: $errorBody" -ForegroundColor Red
    }
}

# 4. Tester la récupération
Write-Host "`n4. Test de récupération des documents..." -ForegroundColor Yellow
try {
    $documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20&sortBy=uploadedAt&sortDir=desc" -Method GET
    Write-Host "Récupération réussie!" -ForegroundColor Green
    Write-Host "   Nombre de documents: $($documentsResponse.totalElements)" -ForegroundColor Gray
    Write-Host "   Pages totales: $($documentsResponse.totalPages)" -ForegroundColor Gray
    
    if ($documentsResponse.content.Count -gt 0) {
        Write-Host "`nDocuments trouves:" -ForegroundColor Cyan
        foreach ($doc in $documentsResponse.content) {
            Write-Host "   - ID: $($doc.id), Nom: $($doc.fileName), Taille: $($doc.fileSize) bytes" -ForegroundColor White
        }
    } else {
        Write-Host "   Aucun document trouve dans la base de donnees" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de la récupération:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Nettoyage
Write-Host "`n5. Nettoyage..." -ForegroundColor Yellow
if (Test-Path $testFile) {
    Remove-Item $testFile -Force
    Write-Host "Fichier de test supprime" -ForegroundColor Green
}

Write-Host "`nTest termine!" -ForegroundColor Cyan
