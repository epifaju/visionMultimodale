import React, { useState } from 'react';
import { documentApi } from '../../services/api';
import type { OcrResult } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface OcrProcessorProps {
  file: File;
  onResult: (result: OcrResult) => void;
  onError: (error: string) => void;
}

export const OcrProcessor: React.FC<OcrProcessorProps> = ({
  file,
  onResult,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);

  const handleProcess = async () => {
    if (!file) {
      onError('Aucun fichier sélectionné');
      return;
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Type de fichier non supporté. Veuillez sélectionner une image (JPEG, PNG, TIFF, BMP)');
      return;
    }

    setIsProcessing(true);
    setResult(null); // Reset du résultat précédent
    
    try {
      console.log('🔍 Démarrage du traitement OCR pour:', file.name, 'Type:', file.type);
      
      const response = await documentApi.extractOcr(file);
      
      if (response.success && response.data) {
        const ocrResult: OcrResult = response.data;
        setResult(ocrResult);
        onResult(ocrResult);
        
        console.log('✅ OCR terminé avec succès:', {
          textLength: ocrResult.textLength,
          confidence: ocrResult.confidence,
          language: ocrResult.language,
          hasError: !!ocrResult.errorMessage
        });
      } else {
        throw new Error(response.error || 'Erreur lors du traitement OCR');
      }
    } catch (error: unknown) {
      console.error('❌ Erreur OCR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du traitement OCR';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Extraction OCR</h3>
            <p className="text-sm text-gray-600">
              Extraction de texte depuis l'image avec Tesseract
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleProcess}
          disabled={isProcessing}
          loading={isProcessing}
          variant="primary"
        >
          {isProcessing ? 'Traitement...' : 'Extraire le texte'}
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Extraction du texte en cours...</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Caractères extraits</div>
              <div className="text-2xl font-bold text-gray-900">{result.textLength}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Confiance</div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(result.confidence * 100)}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Langue détectée</div>
              <div className="text-2xl font-bold text-gray-900">{result.language}</div>
            </div>
          </div>

          {result.text && result.text.trim() && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte extrait ({result.text.length} caractères)
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                  {result.text}
                </pre>
              </div>
            </div>
          )}

          {result.text && !result.text.trim() && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Aucun texte détecté</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    L'image ne contient pas de texte détectable ou la qualité de l'image est insuffisante.
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {result.errorMessage}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
