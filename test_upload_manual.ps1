# Test d'upload manuel
Write-Host "Test d'upload manuel" -ForegroundColor Cyan

# 1. Connexion
$loginData = @{username="admin"; password="admin123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Token obtenu: $($token.Substring(0, 20))..." -ForegroundColor Green

# 2. Créer un fichier de test
$testFile = "test_manual_upload.txt"
"Contenu de test pour upload manuel" | Out-File -FilePath $testFile -Encoding UTF8
Write-Host "Fichier créé: $testFile" -ForegroundColor Green

# 3. Upload avec Invoke-WebRequest
Write-Host "Tentative d'upload..." -ForegroundColor Yellow
try {
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$testFile`"",
        "Content-Type: text/plain",
        "",
        (Get-Content $testFile -Raw),
        "--$boundary--",
        ""
    ) -join $LF
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Body $bodyLines -Headers $headers
    Write-Host "Upload réussi!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de l'upload:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

# 4. Vérifier les documents après upload
Write-Host "`nVérification des documents après upload..." -ForegroundColor Yellow
try {
    $documentsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents?page=0&size=20" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Nombre de documents: $($documentsResponse.totalElements)" -ForegroundColor Green
    if ($documentsResponse.content.Count -gt 0) {
        Write-Host "Documents trouvés:" -ForegroundColor Green
        foreach ($doc in $documentsResponse.content) {
            Write-Host "  - $($doc.fileName) (ID: $($doc.id))" -ForegroundColor Gray
        }
    } else {
        Write-Host "Aucun document trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Red
}



