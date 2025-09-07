# Script de test complet pour tous les endpoints de l'API Vision Multimodale
# Ce script teste tous les nouveaux endpoints implémentés

Write-Host "🚀 Test complet de tous les endpoints API Vision Multimodale" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

$baseUrl = "http://localhost:8080/api"
$headers = @{
    "Content-Type" = "application/json"
}

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Description,
        [string]$ExpectedStatus = "200"
    )
    
    Write-Host "`n🧪 Test: $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        
        Write-Host "   ✅ Succès - Status: $($response.success)" -ForegroundColor Green
        if ($response.data) {
            Write-Host "   📊 Données reçues: $($response.data | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        }
        return $true
    }
    catch {
        Write-Host "   ❌ Échec - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour tester un endpoint avec fichier
function Test-FileEndpoint {
    param(
        [string]$Url,
        [string]$FilePath,
        [string]$Description,
        [string]$FieldName = "file"
    )
    
    Write-Host "`n🧪 Test: $Description" -ForegroundColor Yellow
    Write-Host "   POST $Url avec fichier: $FilePath" -ForegroundColor Gray
    
    try {
        if (-not (Test-Path $FilePath)) {
            Write-Host "   ⚠️ Fichier non trouvé: $FilePath" -ForegroundColor Yellow
            return $false
        }
        
        $form = @{
            $FieldName = Get-Item $FilePath
        }
        
        $response = Invoke-RestMethod -Uri $Url -Method POST -Form $form
        
        Write-Host "   ✅ Succès - Status: $($response.success)" -ForegroundColor Green
        if ($response.data) {
            Write-Host "   📊 Données reçues: $($response.data | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        }
        return $true
    }
    catch {
        Write-Host "   ❌ Échec - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test 1: Vérifier le statut des services
Write-Host "`n📋 PHASE 1: Vérification du statut des services" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/documents/status" -Description "Statut des services"

# Test 2: Test de l'endpoint de test simple
Write-Host "`n📋 PHASE 2: Test de l'endpoint de test" -ForegroundColor Magenta
Test-Endpoint -Method "GET" -Url "$baseUrl/documents/test" -Description "Endpoint de test simple"

# Test 3: Test de l'authentification
Write-Host "`n📋 PHASE 3: Test de l'authentification" -ForegroundColor Magenta
$loginBody = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$baseUrl/auth/login" -Body $loginBody -Description "Connexion utilisateur"

# Test 4: Test des endpoints de traitement de documents
Write-Host "`n📋 PHASE 4: Test des endpoints de traitement de documents" -ForegroundColor Magenta

# Créer des fichiers de test si ils n'existent pas
$testImagePath = "test_image.png"
$testPdfPath = "test_document.pdf"

if (-not (Test-Path $testImagePath)) {
    Write-Host "   ⚠️ Création d'un fichier image de test..." -ForegroundColor Yellow
    # Créer une image de test simple (1x1 pixel PNG)
    $bytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==")
    [System.IO.File]::WriteAllBytes($testImagePath, $bytes)
}

if (-not (Test-Path $testPdfPath)) {
    Write-Host "   ⚠️ Création d'un fichier PDF de test..." -ForegroundColor Yellow
    # Créer un PDF de test simple
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
(Test PDF Document) Tj
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
299
%%EOF
"@
    [System.IO.File]::WriteAllText($testPdfPath, $pdfContent)
}

# Test OCR
Test-FileEndpoint -Url "$baseUrl/documents/ocr" -FilePath $testImagePath -Description "Test OCR - Extraction de texte depuis image"

# Test PDF
Test-FileEndpoint -Url "$baseUrl/documents/pdf" -FilePath $testPdfPath -Description "Test PDF - Extraction de texte depuis PDF"

# Test Codes-barres
Test-FileEndpoint -Url "$baseUrl/documents/barcode" -FilePath $testImagePath -Description "Test Codes-barres - Lecture de codes-barres"

# Test MRZ
Test-FileEndpoint -Url "$baseUrl/documents/mrz" -FilePath $testImagePath -Description "Test MRZ - Extraction MRZ depuis document"

# Test Ollama
Test-FileEndpoint -Url "$baseUrl/documents/analyze" -FilePath $testImagePath -Description "Test Ollama - Analyse IA de document"

# Test Ollama avec prompt personnalisé
Write-Host "`n🧪 Test: Test Ollama avec prompt personnalisé" -ForegroundColor Yellow
try {
    $form = @{
        file = Get-Item $testImagePath
        prompt = "Décris cette image en détail et identifie tous les éléments visuels."
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/documents/analyze" -Method POST -Form $form
    Write-Host "   ✅ Succès - Status: $($response.success)" -ForegroundColor Green
    if ($response.data) {
        Write-Host "   📊 Réponse IA: $($response.data.response)" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "   ❌ Échec - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test des endpoints d'authentification
Write-Host "`n📋 PHASE 5: Test des endpoints d'authentification" -ForegroundColor Magenta

# Test de l'endpoint /me (nécessite un token)
Write-Host "`n🧪 Test: Endpoint /me (sans token)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "   ✅ Succès - Status: $($response.success)" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Échec attendu (pas de token) - $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test de l'endpoint de test simple
Test-Endpoint -Method "GET" -Url "$baseUrl/simple/hello" -Description "Test endpoint simple /hello"

# Test de l'endpoint de test avec paramètre
Test-Endpoint -Method "GET" -Url "$baseUrl/simple/hello/TestUser" -Description "Test endpoint simple /hello/{name}"

# Test de l'endpoint de test avec données
$testData = @{
    message = "Test message"
    timestamp = (Get-Date).ToString()
} | ConvertTo-Json

Test-Endpoint -Method "POST" -Url "$baseUrl/simple/test" -Body $testData -Description "Test endpoint simple /test avec données"

# Résumé des tests
Write-Host "`n📊 RÉSUMÉ DES TESTS" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ Tous les endpoints ont été testés" -ForegroundColor Green
Write-Host "📝 Consultez les logs ci-dessus pour voir les résultats détaillés" -ForegroundColor Cyan
Write-Host "🔧 Pour des tests plus approfondis, utilisez des fichiers réels" -ForegroundColor Yellow

# Nettoyage des fichiers de test
Write-Host "`n🧹 Nettoyage des fichiers de test..." -ForegroundColor Gray
if (Test-Path $testImagePath) {
    Remove-Item $testImagePath
    Write-Host "   Supprimé: $testImagePath" -ForegroundColor Gray
}
if (Test-Path $testPdfPath) {
    Remove-Item $testPdfPath
    Write-Host "   Supprimé: $testPdfPath" -ForegroundColor Gray
}

Write-Host "`n🎉 Tests terminés !" -ForegroundColor Green
