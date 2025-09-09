# Script pour installer et configurer Ollama sur Windows

Write-Host "🤖 Installation et configuration d'Ollama pour Vision Multimodale..." -ForegroundColor Green

# Vérifier si Ollama est déjà installé
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollamaPath) {
    Write-Host "✅ Ollama est déjà installé à: $($ollamaPath.Source)" -ForegroundColor Green
    ollama --version
}
else {
    Write-Host "❌ Ollama n'est pas installé" -ForegroundColor Red
    Write-Host "📥 Téléchargement d'Ollama..." -ForegroundColor Yellow
    
    # URL de téléchargement d'Ollama pour Windows
    $downloadUrl = "https://ollama.ai/download/windows"
    Write-Host "💡 Veuillez télécharger et installer Ollama depuis: $downloadUrl" -ForegroundColor Cyan
    Write-Host "   Ou utilisez winget: winget install Ollama.Ollama" -ForegroundColor Cyan
    
    # Essayer d'installer avec winget
    try {
        Write-Host "🔧 Tentative d'installation avec winget..." -ForegroundColor Yellow
        winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements
        Write-Host "✅ Installation avec winget réussie" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Installation avec winget échouée, veuillez installer manuellement" -ForegroundColor Yellow
        Write-Host "   Téléchargez depuis: $downloadUrl" -ForegroundColor Cyan
        Write-Host "   Puis relancez ce script" -ForegroundColor Cyan
        exit 1
    }
}

# Vérifier l'installation
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaPath) {
    Write-Host "❌ Ollama n'est toujours pas installé" -ForegroundColor Red
    Write-Host "💡 Veuillez installer Ollama manuellement depuis: https://ollama.ai/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ollama installé avec succès!" -ForegroundColor Green

# Démarrer Ollama en arrière-plan
Write-Host "🚀 Démarrage d'Ollama..." -ForegroundColor Yellow
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden

# Attendre que Ollama démarre
Write-Host "⏳ Attente du démarrage d'Ollama..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Vérifier que Ollama fonctionne
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Ollama est démarré et accessible" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️ Ollama n'est pas encore accessible, attente supplémentaire..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 10
        Write-Host "✅ Ollama est maintenant accessible" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Ollama ne répond pas. Veuillez le démarrer manuellement avec: ollama serve" -ForegroundColor Red
    }
}

# Installer le modèle configuré
$model = "llama3.2:1b"
Write-Host "📦 Installation du modèle $model..." -ForegroundColor Yellow

try {
    ollama pull $model
    Write-Host "✅ Modèle $model installé avec succès" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors de l'installation du modèle $model" -ForegroundColor Red
    Write-Host "💡 Essayez manuellement: ollama pull $model" -ForegroundColor Yellow
}

# Vérifier les modèles installés
Write-Host "📋 Modèles Ollama installés:" -ForegroundColor Cyan
try {
    ollama list
}
catch {
    Write-Host "❌ Impossible de lister les modèles" -ForegroundColor Red
}

# Tester le modèle
Write-Host "🧪 Test du modèle..." -ForegroundColor Yellow
try {
    $testResponse = ollama run $model "Hello, test message"
    Write-Host "✅ Test du modèle réussi" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Test du modèle échoué, mais l'installation semble correcte" -ForegroundColor Yellow
}

Write-Host "`n🎯 Configuration Ollama terminée!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser l'analyse IA dans Vision Multimodale." -ForegroundColor Cyan
Write-Host "`n💡 Commandes utiles:" -ForegroundColor Yellow
Write-Host "  - Démarrer Ollama: ollama serve" -ForegroundColor White
Write-Host "  - Lister les modèles: ollama list" -ForegroundColor White
Write-Host "  - Installer un modèle: ollama pull <nom-du-modele>" -ForegroundColor White
Write-Host "  - Arrêter Ollama: Ctrl+C dans la fenêtre de commande" -ForegroundColor White
