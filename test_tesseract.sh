#!/bin/bash

echo "=== Test d'installation de Tesseract ==="

# Vérifier que Tesseract est installé
echo "1. Vérification de l'installation Tesseract:"
if command -v tesseract &> /dev/null; then
    echo "✅ Tesseract est installé"
    tesseract --version
else
    echo "❌ Tesseract n'est pas installé"
    exit 1
fi

# Vérifier les langues disponibles
echo -e "\n2. Langues Tesseract disponibles:"
ls -la /usr/share/tessdata/

# Vérifier les langues spécifiques
echo -e "\n3. Vérification des langues français et anglais:"
if [ -f "/usr/share/tessdata/fra.traineddata" ]; then
    echo "✅ Français disponible"
else
    echo "❌ Français manquant"
fi

if [ -f "/usr/share/tessdata/eng.traineddata" ]; then
    echo "✅ Anglais disponible"
else
    echo "❌ Anglais manquant"
fi

# Vérifier les autres outils
echo -e "\n4. Vérification des autres outils:"
if command -v pdftotext &> /dev/null; then
    echo "✅ Poppler (PDF) disponible"
else
    echo "❌ Poppler (PDF) manquant"
fi

if command -v zbarimg &> /dev/null; then
    echo "✅ ZBar (codes-barres) disponible"
else
    echo "❌ ZBar (codes-barres) manquant"
fi

echo -e "\n=== Test terminé ==="
