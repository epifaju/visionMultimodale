# Test de l'endpoint sans authentification
Write-Host "🧪 Test de l'endpoint /api/documents/test-upload SANS authentification" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Créer un fichier PDF de test minimal
$testPdfPath = "test_no_auth.pdf"
$pdfContent = @"
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF No Auth) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF
"@

$pdfContent | Out-File -FilePath $testPdfPath -Encoding ASCII

try {
    Write-Host "`n1. Test avec curl (sans headers d'authentification)..." -ForegroundColor Yellow
    
    # Test avec curl
    $curlCommand = "curl -X POST -F 'file=@$testPdfPath' http://localhost:8080/api/documents/test-upload -v"
    Write-Host "   Commande: $curlCommand" -ForegroundColor Gray
    
    $curlResult = Invoke-Expression $curlCommand
    Write-Host "   Résultat curl:" -ForegroundColor Green
    Write-Host $curlResult -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur avec curl: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Write-Host "`n2. Test avec PowerShell (sans headers d'authentification)..." -ForegroundColor Yellow
    
    $form = @{
        file = Get-Item $testPdfPath
    }
    
    # Test sans headers d'authentification
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Form $form -ContentType "multipart/form-data"
    
    Write-Host "✅ Upload réussi sans authentification !" -ForegroundColor Green
    Write-Host "   Réponse du serveur:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur lors de l'upload sans authentification" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response Body: $responseBody" -ForegroundColor Red
    }
}

try {
    Write-Host "`n3. Test avec PowerShell (avec headers d'authentification invalide)..." -ForegroundColor Yellow
    
    $form = @{
        file = Get-Item $testPdfPath
    }
    
    # Test avec un token invalide
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Form $form -ContentType "multipart/form-data" -Headers @{
        "Authorization" = "Bearer invalid-token-12345"
    }
    
    Write-Host "✅ Upload réussi même avec token invalide !" -ForegroundColor Green
    Write-Host "   Réponse du serveur:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur avec token invalide" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
}

# Nettoyer
if (Test-Path $testPdfPath) {
    Remove-Item $testPdfPath -Force
    Write-Host "`n   Fichier de test supprimé" -ForegroundColor Gray
}

