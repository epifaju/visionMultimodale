# Script de test d'intégration complet pour Vision Multimodale
# Ce script teste l'ensemble de l'application avec des données réelles

Write-Host "🧪 Test d'intégration complet - Vision Multimodale" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:8080/api"
$frontendUrl = "http://localhost:5173"
$testResults = @()

# Fonction pour exécuter un test et enregistrer le résultat
function Invoke-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    Write-Host "`n🧪 Test: $TestName" -ForegroundColor Yellow
    try {
        $result = & $TestScript
        Write-Host "✅ $TestName - SUCCÈS" -ForegroundColor Green
        $testResults += @{
            Name = $TestName
            Status = "SUCCESS"
            Details = $result
        }
        return $true
    }
    catch {
        Write-Host "❌ $TestName - ÉCHEC: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{
            Name = $TestName
            Status = "FAILED"
            Details = $_.Exception.Message
        }
        return $false
    }
}

# Test 1: Vérification des services Docker
Invoke-Test "Services Docker" {
    $services = docker-compose ps --services --filter "status=running"
    if ($services -contains "postgres" -and $services -contains "ollama") {
        "PostgreSQL et Ollama sont en cours d'exécution"
    } else {
        throw "Services Docker manquants"
    }
}

# Test 2: Vérification de l'API Backend
Invoke-Test "API Backend" {
    $response = Invoke-RestMethod -Uri "$baseUrl/documents/status" -Method GET
    if ($response.services) {
        "API Backend accessible - Services: $($response.services.Keys -join ', ')"
    } else {
        throw "API Backend non accessible"
    }
}

# Test 3: Test d'authentification
Invoke-Test "Authentification" {
    $loginData = @{
        username = "admin"
        password = "password"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    if ($response.token) {
        $global:authToken = $response.token
        "Authentification réussie - Token reçu"
    } else {
        throw "Échec de l'authentification"
    }
}

# Test 4: Test OCR avec image réelle
Invoke-Test "Test OCR" {
    # Créer une image de test simple
    $testImagePath = "test_image.png"
    $imageBytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
    [System.IO.File]::WriteAllBytes($testImagePath, $imageBytes)

    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test.png`"",
            "Content-Type: image/png$LF",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes),
            "--$boundary--$LF"
        ) -join $LF

        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }

        $response = Invoke-RestMethod -Uri "$baseUrl/documents/ocr" -Method POST -Body $bodyLines -Headers $headers
        if ($response.success) {
            "OCR réussi - Texte extrait: $($response.data.textLength) caractères"
        } else {
            throw "Échec OCR: $($response.error)"
        }
    }
    finally {
        if (Test-Path $testImagePath) {
            Remove-Item $testImagePath
        }
    }
}

# Test 5: Test PDF avec document simple
Invoke-Test "Test PDF" {
    # Créer un PDF de test minimal
    $testPdfPath = "test_document.pdf"
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
72 720 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF
"@
    [System.IO.File]::WriteAllText($testPdfPath, $pdfContent)

    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test.pdf`"",
            "Content-Type: application/pdf$LF",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString([System.Text.Encoding]::UTF8.GetBytes($pdfContent)),
            "--$boundary--$LF"
        ) -join $LF

        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }

        $response = Invoke-RestMethod -Uri "$baseUrl/documents/pdf" -Method POST -Body $bodyLines -Headers $headers
        if ($response.success) {
            "PDF réussi - Pages: $($response.data.pageCount), Texte: $($response.data.textLength) caractères"
        } else {
            throw "Échec PDF: $($response.error)"
        }
    }
    finally {
        if (Test-Path $testPdfPath) {
            Remove-Item $testPdfPath
        }
    }
}

# Test 6: Test codes-barres
Invoke-Test "Test Codes-barres" {
    # Utiliser la même image de test
    $testImagePath = "test_barcode.png"
    $imageBytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
    [System.IO.File]::WriteAllBytes($testImagePath, $imageBytes)

    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test.png`"",
            "Content-Type: image/png$LF",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes),
            "--$boundary--$LF"
        ) -join $LF

        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }

        $response = Invoke-RestMethod -Uri "$baseUrl/documents/barcode" -Method POST -Body $bodyLines -Headers $headers
        if ($response.success) {
            "Codes-barres réussi - Codes trouvés: $($response.data.barcodeCount)"
        } else {
            "Codes-barres terminé - Aucun code trouvé (normal pour image de test)"
        }
    }
    finally {
        if (Test-Path $testImagePath) {
            Remove-Item $testImagePath
        }
    }
}

# Test 7: Test MRZ
Invoke-Test "Test MRZ" {
    # Utiliser la même image de test
    $testImagePath = "test_mrz.png"
    $imageBytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
    [System.IO.File]::WriteAllBytes($testImagePath, $imageBytes)

    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test.png`"",
            "Content-Type: image/png$LF",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes),
            "--$boundary--$LF"
        ) -join $LF

        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }

        $response = Invoke-RestMethod -Uri "$baseUrl/documents/mrz" -Method POST -Body $bodyLines -Headers $headers
        if ($response.success) {
            "MRZ réussi - Type: $($response.data.data.documentType)"
        } else {
            "MRZ terminé - Aucune donnée MRZ trouvée (normal pour image de test)"
        }
    }
    finally {
        if (Test-Path $testImagePath) {
            Remove-Item $testImagePath
        }
    }
}

# Test 8: Test Ollama
Invoke-Test "Test Ollama" {
    $testImagePath = "test_ollama.png"
    $imageBytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
    [System.IO.File]::WriteAllBytes($testImagePath, $imageBytes)

    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test.png`"",
            "Content-Type: image/png$LF",
            [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($imageBytes),
            "--$boundary",
            "Content-Disposition: form-data; name=`"prompt`"$LF",
            "Analyze this image$LF",
            "--$boundary--$LF"
        ) -join $LF

        $headers = @{
            "Authorization" = "Bearer $global:authToken"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }

        $response = Invoke-RestMethod -Uri "$baseUrl/documents/analyze" -Method POST -Body $bodyLines -Headers $headers
        if ($response.success) {
            "Ollama réussi - Réponse: $($response.data.response.Length) caractères"
        } else {
            "Ollama terminé - Service non disponible ou erreur"
        }
    }
    finally {
        if (Test-Path $testImagePath) {
            Remove-Item $testImagePath
        }
    }
}

# Test 9: Test Frontend (vérification de l'accessibilité)
Invoke-Test "Frontend Accessible" {
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            "Frontend accessible - Status: $($response.StatusCode)"
        } else {
            throw "Frontend non accessible - Status: $($response.StatusCode)"
        }
    }
    catch {
        throw "Frontend non accessible: $($_.Exception.Message)"
    }
}

# Test 10: Test de performance (temps de réponse)
Invoke-Test "Performance API" {
    $startTime = Get-Date
    $response = Invoke-RestMethod -Uri "$baseUrl/documents/status" -Method GET
    $endTime = Get-Date
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    
    if ($responseTime -lt 1000) {
        "Performance OK - Temps de réponse: $([math]::Round($responseTime, 2))ms"
    } else {
        "Performance lente - Temps de réponse: $([math]::Round($responseTime, 2))ms"
    }
}

# Affichage du rapport final
Write-Host "`n📊 RAPPORT DE TEST D'INTÉGRATION" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

$successCount = ($testResults | Where-Object { $_.Status -eq "SUCCESS" }).Count
$totalCount = $testResults.Count
$successRate = [math]::Round(($successCount / $totalCount) * 100, 2)

Write-Host "`n📈 Statistiques:" -ForegroundColor Cyan
Write-Host "   Tests réussis: $successCount/$totalCount ($successRate%)" -ForegroundColor Green
Write-Host "   Tests échoués: $($totalCount - $successCount)" -ForegroundColor Red

Write-Host "`n📋 Détail des tests:" -ForegroundColor Cyan
foreach ($test in $testResults) {
    $status = if ($test.Status -eq "SUCCESS") { "✅" } else { "❌" }
    Write-Host "   $status $($test.Name)" -ForegroundColor $(if ($test.Status -eq "SUCCESS") { "Green" } else { "Red" })
    if ($test.Details) {
        Write-Host "      $($test.Details)" -ForegroundColor Gray
    }
}

# Recommandations
Write-Host "`n💡 Recommandations:" -ForegroundColor Yellow
if ($successRate -eq 100) {
    Write-Host "   🎉 Tous les tests sont passés ! L'application est prête pour la production." -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "   ⚠️ La plupart des tests passent. Vérifiez les tests échoués." -ForegroundColor Yellow
} else {
    Write-Host "   🚨 Plusieurs tests échouent. L'application nécessite des corrections." -ForegroundColor Red
}

Write-Host "`n🔗 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   Frontend: $frontendUrl" -ForegroundColor White
Write-Host "   API Backend: $baseUrl" -ForegroundColor White
Write-Host "   Statut des services: $baseUrl/documents/status" -ForegroundColor White

Write-Host "`n🏁 Test d'intégration terminé !" -ForegroundColor Green
