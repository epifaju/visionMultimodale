# Test simple d'upload
Write-Host "Test d'upload simple" -ForegroundColor Cyan

# Créer un fichier de test
$testFile = "test_simple.txt"
"Contenu de test" | Out-File -FilePath $testFile -Encoding UTF8

# Test d'upload avec curl (plus fiable que PowerShell)
Write-Host "Upload du fichier..." -ForegroundColor Yellow
$curlCommand = "curl -X POST -F `"file=@$testFile`" http://localhost:8080/api/documents/test-upload"
Invoke-Expression $curlCommand

# Test de récupération
Write-Host "`nRecuperation des documents..." -ForegroundColor Yellow
$documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET
Write-Host "Nombre de documents: $($documentsResponse.totalElements)" -ForegroundColor Green

if ($documentsResponse.content.Count -gt 0) {
    Write-Host "Documents trouves:" -ForegroundColor Green
    foreach ($doc in $documentsResponse.content) {
        Write-Host "  - $($doc.fileName) (ID: $($doc.id))" -ForegroundColor White
    }
} else {
    Write-Host "Aucun document trouve" -ForegroundColor Red
}

# Nettoyage
Remove-Item $testFile -Force -ErrorAction SilentlyContinue



