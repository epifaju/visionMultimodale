# Script de test pour diagnostiquer le problème d'authentification PDF
# Ce script teste l'authentification JWT et l'endpoint PDF

Write-Host "🔍 Diagnostic du problème d'authentification PDF" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Test de l'endpoint de test d'authentification
Write-Host "`n1. Test de l'endpoint de test d'authentification..." -ForegroundColor Yellow
try {
    $authTestResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-auth" -Method GET
    Write-Host "✅ Endpoint test-auth accessible" -ForegroundColor Green
    Write-Host "Réponse: $($authTestResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur endpoint test-auth: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test de l'endpoint de test d'authentification POST
Write-Host "`n2. Test de l'endpoint de test d'authentification POST..." -ForegroundColor Yellow
try {
    $authTestPostResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/test-auth-post" -Method POST
    Write-Host "✅ Endpoint test-auth-post accessible" -ForegroundColor Green
    Write-Host "Réponse: $($authTestPostResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur endpoint test-auth-post: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test de l'endpoint PDF sans authentification (devrait échouer)
Write-Host "`n3. Test de l'endpoint PDF sans authentification (devrait échouer)..." -ForegroundColor Yellow
try {
    $pdfResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/pdf" -Method POST
    Write-Host "⚠️ Endpoint PDF accessible sans authentification (problème de sécurité!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Endpoint PDF correctement protégé (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Test de l'endpoint PDF avec un token JWT factice
Write-Host "`n4. Test de l'endpoint PDF avec un token JWT factice..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer fake-jwt-token-for-testing"
        "Content-Type" = "multipart/form-data"
    }
    $pdfResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/pdf" -Method POST -Headers $headers
    Write-Host "⚠️ Endpoint PDF accessible avec token factice (problème de sécurité!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Endpoint PDF correctement protégé contre les tokens factices (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Test de l'endpoint de statut des services
Write-Host "`n5. Test de l'endpoint de statut des services..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/documents/status" -Method GET
    Write-Host "✅ Endpoint status accessible" -ForegroundColor Green
    Write-Host "Services disponibles:" -ForegroundColor Gray
    $statusResponse.services | ForEach-Object {
        $service = $_
        Write-Host "  - $($service.Key): $($service.Value.available)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur endpoint status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Diagnostic terminé" -ForegroundColor Cyan
Write-Host "Vérifiez les logs du backend pour plus de détails." -ForegroundColor Gray

