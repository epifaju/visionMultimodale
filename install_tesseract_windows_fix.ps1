# Script pour installer Tesseract OCR sur Windows
# Ce script résout les problèmes d'accès mémoire en installant Tesseract correctement

Write-Host "🔧 Installation de Tesseract OCR pour Windows..." -ForegroundColor Green

# Vérifier si Tesseract est déjà installé
$tesseractPath = Get-Command tesseract -ErrorAction SilentlyContinue
if ($tesseractPath) {
    Write-Host "✅ Tesseract est déjà installé à: $($tesseractPath.Source)" -ForegroundColor Green
    tesseract --version
} else {
    Write-Host "❌ Tesseract n'est pas installé" -ForegroundColor Red
    Write-Host "📥 Téléchargement de Tesseract OCR..." -ForegroundColor Yellow
    
    # URL de téléchargement de Tesseract pour Windows
    $downloadUrl = "https://github.com/UB-Mannheim/tesseract/releases/download/v5.3.0.20221214/tesseract-ocr-w64-setup-5.3.0.20221214.exe"
    $installerPath = "$env:TEMP\tesseract-installer.exe"
    
    try {
        # Télécharger l'installateur
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✅ Téléchargement terminé" -ForegroundColor Green
        
        # Installer Tesseract
        Write-Host "🔧 Installation de Tesseract..." -ForegroundColor Yellow
        Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait
        
        # Nettoyer l'installateur
        Remove-Item $installerPath -Force
        
        Write-Host "✅ Installation terminée" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de l'installation: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Veuillez installer Tesseract manuellement depuis: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow
    }
}

# Vérifier l'installation
$tesseractPath = Get-Command tesseract -ErrorAction SilentlyContinue
if ($tesseractPath) {
    Write-Host "✅ Tesseract installé avec succès!" -ForegroundColor Green
    tesseract --version
    
    # Vérifier les fichiers de données
    $tessDataPath = "C:\Program Files\Tesseract-OCR\tessdata"
    if (Test-Path $tessDataPath) {
        Write-Host "✅ Répertoire tessdata trouvé: $tessDataPath" -ForegroundColor Green
        
        # Lister les fichiers de langue disponibles
        $langFiles = Get-ChildItem -Path $tessDataPath -Filter "*.traineddata"
        Write-Host "📚 Langues disponibles:" -ForegroundColor Cyan
        foreach ($file in $langFiles) {
            $langName = $file.BaseName
            Write-Host "  - $langName" -ForegroundColor White
        }
        
        # Vérifier si eng.traineddata existe
        if (Test-Path "$tessDataPath\eng.traineddata") {
            Write-Host "✅ Fichier anglais (eng.traineddata) trouvé" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Fichier anglais (eng.traineddata) manquant" -ForegroundColor Yellow
        }
        
        # Vérifier si fra.traineddata existe
        if (Test-Path "$tessDataPath\fra.traineddata") {
            Write-Host "✅ Fichier français (fra.traineddata) trouvé" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Fichier français (fra.traineddata) manquant" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Répertoire tessdata non trouvé: $tessDataPath" -ForegroundColor Red
    }
    
    # Créer un lien symbolique vers le répertoire tessdata local
    $localTessData = ".\tessdata"
    if (-not (Test-Path $localTessData)) {
        New-Item -ItemType Directory -Path $localTessData -Force | Out-Null
        Write-Host "📁 Répertoire tessdata local créé: $localTessData" -ForegroundColor Green
    }
    
    # Copier les fichiers de langue nécessaires
    if (Test-Path "$tessDataPath\eng.traineddata") {
        Copy-Item "$tessDataPath\eng.traineddata" "$localTessData\" -Force
        Write-Host "✅ Fichier eng.traineddata copié localement" -ForegroundColor Green
    }
    
    if (Test-Path "$tessDataPath\fra.traineddata") {
        Copy-Item "$tessDataPath\fra.traineddata" "$localTessData\" -Force
        Write-Host "✅ Fichier fra.traineddata copié localement" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Tesseract n'est toujours pas installé" -ForegroundColor Red
    Write-Host "💡 Veuillez installer Tesseract manuellement depuis: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow
}

Write-Host "`n🎯 Configuration terminée!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant relancer l'application Spring Boot." -ForegroundColor Cyan
