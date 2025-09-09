#!/usr/bin/env pwsh

Write-Host "🚀 Test du démarrage du backend" -ForegroundColor Green

# Fonction pour tester si le serveur répond
function Test-BackendAvailable {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ping" -Method GET -TimeoutSec 5
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Attendre que le serveur démarre
Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    if (Test-BackendAvailable) {
        Write-Host "✅ Backend disponible après $i tentatives !" -ForegroundColor Green
        
        # Test CORS
        try {
            $corsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/documents/ping" -Method GET -Headers @{"Origin"="http://localhost:5173"}
            Write-Host "✅ Test CORS réussi - Status: $($corsResponse.StatusCode)" -ForegroundColor Green
            
            # Afficher les headers CORS
            if ($corsResponse.Headers.ContainsKey("Access-Control-Allow-Origin")) {
                Write-Host "✅ Access-Control-Allow-Origin: $($corsResponse.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Header Access-Control-Allow-Origin manquant" -ForegroundColor Yellow
            }
            
            exit 0
        }
        catch {
            Write-Host "❌ Erreur CORS: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "❌ Timeout - Backend non disponible après 60 secondes" -ForegroundColor Red
exit 1
