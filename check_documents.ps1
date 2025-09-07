# Vérification des documents uploadés
Write-Host "Verification des documents uploades" -ForegroundColor Cyan

# 1. Connexion
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.token

# 2. Vérification des documents
$documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers @{"Authorization"="Bearer $token"}

Write-Host "Nombre de documents dans la base: $($documentsResponse.totalElements)" -ForegroundColor Green
Write-Host "Pages totales: $($documentsResponse.totalPages)" -ForegroundColor Gray

if ($documentsResponse.content.Count -gt 0) {
    Write-Host "Documents trouves:" -ForegroundColor Green
    foreach ($doc in $documentsResponse.content) {
        Write-Host "  - ID: $($doc.id), Nom: $($doc.fileName), Taille: $($doc.fileSize) bytes, Statut: $($doc.status)" -ForegroundColor White
    }
} else {
    Write-Host "Aucun document trouve dans la base de donnees" -ForegroundColor Red
}
