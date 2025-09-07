# Script pour vérifier les logs du backend
Write-Host "🔍 Vérification des logs du backend" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`n1. Vérification que le backend est démarré..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/public/health" -Method GET
    Write-Host "✅ Backend accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible" -ForegroundColor Red
    Write-Host "   Veuillez démarrer le backend avec: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n2. Test de l'endpoint test-upload avec curl pour voir les logs..." -ForegroundColor Yellow

# Créer un fichier de test
$testFile = "test_logs.pdf"
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
(Test Logs) Tj
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

$pdfContent | Out-File -FilePath $testFile -Encoding ASCII

Write-Host "   Envoi de la requête avec curl (verbose)..." -ForegroundColor Gray
Write-Host "   Surveillez les logs du backend dans le terminal où il est démarré" -ForegroundColor Yellow

try {
    # Utiliser curl avec verbose pour voir les détails
    $curlResult = & curl -X POST -F "file=@$testFile" http://localhost:8080/api/documents/test-upload -v 2>&1
    Write-Host "   Résultat curl:" -ForegroundColor Green
    Write-Host $curlResult -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur avec curl: $($_.Exception.Message)" -ForegroundColor Red
}

# Nettoyer
if (Test-Path $testFile) {
    Remove-Item $testFile -Force
}

Write-Host "`n3. Instructions pour vérifier les logs du backend:" -ForegroundColor Cyan
Write-Host "   - Regardez le terminal où le backend est démarré" -ForegroundColor White
Write-Host "   - Cherchez les logs qui commencent par '📁 Test Upload'" -ForegroundColor White
Write-Host "   - Vérifiez s'il y a des erreurs JWT ou d'authentification" -ForegroundColor White
Write-Host "   - Les logs devraient montrer le traitement de la requête" -ForegroundColor White

Write-Host "`n4. Test des endpoints de documents..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test" -Method GET
    Write-Host "✅ Endpoint /documents/test accessible" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint /documents/test non accessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
