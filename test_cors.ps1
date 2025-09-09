# Test CORS pour l'endpoint OCR
Write-Host "Testing CORS for OCR endpoint..."

# Attendre que le serveur démarre
Start-Sleep -Seconds 10

# Test de la requête OPTIONS (preflight)
Write-Host "Testing OPTIONS request (preflight)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ocr" -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    } -Verbose
    
    Write-Host "OPTIONS Response Status: $($response.StatusCode)"
    Write-Host "CORS Headers:"
    $response.Headers | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)"
    }
} catch {
    Write-Host "OPTIONS request failed: $($_.Exception.Message)"
}

# Test de la requête GET simple
Write-Host "`nTesting GET request..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ping" -Method GET -Headers @{
        "Origin" = "http://localhost:5173"
    } -Verbose
    
    Write-Host "GET Response Status: $($response.StatusCode)"
    Write-Host "Response Body: $($response.Content)"
    Write-Host "CORS Headers:"
    $response.Headers | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)"
    }
} catch {
    Write-Host "GET request failed: $($_.Exception.Message)"
}
