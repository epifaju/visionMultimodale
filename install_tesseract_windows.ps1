# Script d'installation de Tesseract OCR pour Windows
Write-Host "🔧 Installation de Tesseract OCR pour Windows" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Vérifier si Tesseract est déjà installé
Write-Host "`n1. Vérification de l'installation existante..." -ForegroundColor Yellow
$tesseractPaths = @(
    "C:\Program Files\Tesseract-OCR\tesseract.exe",
    "C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
)

$tesseractFound = $false
foreach ($path in $tesseractPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Tesseract trouvé à: $path" -ForegroundColor Green
        $tesseractFound = $true
        break
    }
}

if (-not $tesseractFound) {
    Write-Host "❌ Tesseract non trouvé" -ForegroundColor Red
    Write-Host "`n2. Instructions d'installation manuelle:" -ForegroundColor Yellow
    Write-Host "   1. Téléchargez Tesseract depuis: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor White
    Write-Host "   2. Installez-le dans: C:\Program Files\Tesseract-OCR\" -ForegroundColor White
    Write-Host "   3. Ajoutez au PATH: C:\Program Files\Tesseract-OCR\" -ForegroundColor White
    Write-Host "   4. Redémarrez votre terminal" -ForegroundColor White
    
    Write-Host "`n3. Installation automatique avec Chocolatey (si disponible):" -ForegroundColor Yellow
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "   Exécution: choco install tesseract" -ForegroundColor White
        $install = Read-Host "Voulez-vous installer Tesseract avec Chocolatey? (y/n)"
        if ($install -eq "y" -or $install -eq "Y") {
            choco install tesseract -y
        }
    } else {
        Write-Host "   Chocolatey non disponible. Installation manuelle requise." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n2. Test de Tesseract..." -ForegroundColor Yellow
    try {
        $version = & tesseract --version 2>&1
        Write-Host "✅ Version Tesseract: $($version[0])" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du test de Tesseract: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n4. Vérification des données de langue..." -ForegroundColor Yellow
$tessDataPaths = @(
    "C:\Program Files\Tesseract-OCR\tessdata",
    "C:\Program Files (x86)\Tesseract-OCR\tessdata"
)

foreach ($path in $tessDataPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Dossier tessdata trouvé: $path" -ForegroundColor Green
        $files = Get-ChildItem $path -Filter "*.traineddata"
        Write-Host "   Fichiers de langue disponibles:" -ForegroundColor White
        foreach ($file in $files) {
            Write-Host "     - $($file.Name)" -ForegroundColor Gray
        }
        break
    }
}

Write-Host "`n🎉 Vérification terminée!" -ForegroundColor Cyan
Write-Host "Si Tesseract est installé, redémarrez l'application backend." -ForegroundColor Green



