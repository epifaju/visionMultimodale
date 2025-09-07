#!/usr/bin/env pwsh

# Script de test pour vérifier les corrections
Write-Host "🧪 Test des corrections de l'application Vision Multimodale" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Description,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "`n🔍 Test: $Description" -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    Write-Host "   Method: $Method" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ Succès: $($response.message)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        }
        return $false
    }
}

# Test 1: Vérifier que le backend est accessible
Write-Host "`n📡 Test de connectivité backend..." -ForegroundColor Magenta
$backendUp = Test-Endpoint -Url "http://localhost:8080/api/documents/ping" -Description "Ping backend"

if (-not $backendUp) {
    Write-Host "`n❌ Le backend n'est pas accessible. Veuillez démarrer le backend Spring Boot." -ForegroundColor Red
    Write-Host "   Commandes possibles:" -ForegroundColor Yellow
    Write-Host "   - cd backend && mvn spring-boot:run" -ForegroundColor Gray
    Write-Host "   - ou utilisez votre IDE pour démarrer VisionMultimodaleApplication" -ForegroundColor Gray
    exit 1
}

# Test 2: Test des endpoints d'authentification
Write-Host "`n🔐 Test des endpoints d'authentification..." -ForegroundColor Magenta
Test-Endpoint -Url "http://localhost:8080/api/auth/test" -Description "Test endpoint auth"
Test-Endpoint -Url "http://localhost:8080/api/auth/test-auth-post" -Method "POST" -Description "Test auth POST"

# Test 3: Test des endpoints de documents
Write-Host "`n📄 Test des endpoints de documents..." -ForegroundColor Magenta
Test-Endpoint -Url "http://localhost:8080/api/documents/test" -Description "Test endpoint documents"
Test-Endpoint -Url "http://localhost:8080/api/documents/status" -Description "Statut des services"

# Test 4: Test d'upload de fichier (simulation)
Write-Host "`n📁 Test d'upload de fichier..." -ForegroundColor Magenta
$testFile = "test.txt"
"Ceci est un fichier de test" | Out-File -FilePath $testFile -Encoding UTF8

try {
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$testFile`"",
        "Content-Type: text/plain$LF",
        "Ceci est un fichier de test",
        "--$boundary--$LF"
    ) -join $LF

    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-upload" -Method POST -Body $bodyLines -Headers $headers -TimeoutSec 30
    Write-Host "   ✅ Upload test réussi: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Erreur upload: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    if (Test-Path $testFile) {
        Remove-Item $testFile
    }
}

# Test 5: Test de connexion (simulation)
Write-Host "`n🔑 Test de connexion..." -ForegroundColor Magenta
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Test-Endpoint -Url "http://localhost:8080/api/auth/test-login" -Method "POST" -Description "Test login endpoint" -Body $loginData

# Test 6: Vérifier le frontend
Write-Host "`n🌐 Test du frontend..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 10 -UseBasicParsing
    Write-Host "   ✅ Frontend accessible (Status: $($response.StatusCode))" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Veuillez démarrer le frontend avec: cd frontend && npm run dev" -ForegroundColor Yellow
}

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Green
Write-Host "`n📋 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "   1. ✅ Configuration CORS élargie pour permettre toutes les origines" -ForegroundColor Green
Write-Host "   2. ✅ Endpoints d'upload rendus accessibles sans authentification" -ForegroundColor Green
Write-Host "   3. ✅ Intercepteur axios corrigé pour gérer les FormData" -ForegroundColor Green
Write-Host "   4. ✅ Services API simplifiés et standardisés" -ForegroundColor Green
Write-Host "   5. ✅ Gestion d'erreurs améliorée" -ForegroundColor Green

Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Redémarrez le backend Spring Boot" -ForegroundColor White
Write-Host "   2. Redémarrez le frontend React" -ForegroundColor White
Write-Host "   3. Testez la connexion avec admin/admin123" -ForegroundColor White
Write-Host "   4. Testez l'upload de fichiers" -ForegroundColor White
