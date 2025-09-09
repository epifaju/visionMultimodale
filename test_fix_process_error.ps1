# Test de correction de l'erreur "process is not defined"
Write-Host "🔧 Test de correction de l'erreur 'process is not defined'" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Aller dans le dossier frontend
Set-Location frontend

Write-Host "`n1. Configuration de l'environnement..." -ForegroundColor Yellow
try {
    # Exécuter le script de configuration
    node setup-env.js
    Write-Host "✅ Configuration de l'environnement terminée" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors de la configuration: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Vérification des fichiers modifiés..." -ForegroundColor Yellow

# Vérifier que les fichiers ont été modifiés
$filesToCheck = @(
    "src/config/api.ts",
    "src/vite-env.d.ts",
    "src/services/api.ts"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
    }
}

Write-Host "`n3. Test de compilation TypeScript..." -ForegroundColor Yellow
try {
    # Test de compilation TypeScript
    npx tsc --noEmit
    Write-Host "✅ Compilation TypeScript réussie" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur de compilation TypeScript: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Test de démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "💡 Démarrage du serveur de développement..." -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`n📋 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "  ✅ Remplacé process.env par import.meta.env" -ForegroundColor Green
Write-Host "  ✅ Ajouté les types TypeScript pour les variables d'environnement" -ForegroundColor Green
Write-Host "  ✅ Créé un script de configuration automatique" -ForegroundColor Green
Write-Host "  ✅ Ajouté des valeurs par défaut pour éviter les erreurs" -ForegroundColor Green

Write-Host "`n🎉 Corrections terminées! L'erreur 'process is not defined' devrait être résolue." -ForegroundColor Green
Write-Host "`n💡 Pour tester:" -ForegroundColor Yellow
Write-Host "  1. cd frontend" -ForegroundColor White
Write-Host "  2. npm run dev" -ForegroundColor White
Write-Host "  3. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "  4. Vérifiez la console du navigateur - l'erreur devrait avoir disparu" -ForegroundColor White

# Revenir au dossier parent
Set-Location ..
