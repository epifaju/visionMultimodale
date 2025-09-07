import React, { useState } from 'react';
import { documentApi } from '../../services/api';
import type { BarcodeResult, BarcodeInfo } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BarcodeProcessorProps {
  file: File;
  onResult: (result: BarcodeResult) => void;
  onError: (error: string) => void;
}

export const BarcodeProcessor: React.FC<BarcodeProcessorProps> = ({
  file,
  onResult,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BarcodeResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      console.log('📊 Démarrage du traitement codes-barres pour:', file.name);
      
      const response = await documentApi.readBarcodes(file);
      
      if (response.success && response.data) {
        const barcodeResult: BarcodeResult = response.data;
        setResult(barcodeResult);
        onResult(barcodeResult);
        
        console.log('✅ Codes-barres traités avec succès:', {
          count: barcodeResult.barcodeCount,
          types: barcodeResult.typeCounts
        });
      } else {
        throw new Error(response.error || 'Erreur lors du traitement des codes-barres');
      }
    } catch (error: any) {
      console.error('❌ Erreur codes-barres:', error);
      onError(error.message || 'Erreur lors du traitement des codes-barres');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFormatIcon = (format: string): string => {
    const formatIcons: Record<string, string> = {
      'QR_CODE': '🔲',
      'DATA_MATRIX': '⬜',
      'PDF_417': '📊',
      'AZTEC': '🔷',
      'CODE_128': '📏',
      'CODE_39': '📏',
      'EAN_13': '📏',
      'EAN_8': '📏',
      'UPC_A': '📏',
      'UPC_E': '📏',
      'ITF': '📏',
      'CODABAR': '📏',
    };
    return formatIcons[format] || '📊';
  };

  const getFormatColor = (format: string): string => {
    const formatColors: Record<string, string> = {
      'QR_CODE': 'bg-blue-100 text-blue-800',
      'DATA_MATRIX': 'bg-green-100 text-green-800',
      'PDF_417': 'bg-purple-100 text-purple-800',
      'AZTEC': 'bg-indigo-100 text-indigo-800',
      'CODE_128': 'bg-gray-100 text-gray-800',
      'CODE_39': 'bg-gray-100 text-gray-800',
      'EAN_13': 'bg-orange-100 text-orange-800',
      'EAN_8': 'bg-orange-100 text-orange-800',
      'UPC_A': 'bg-yellow-100 text-yellow-800',
      'UPC_E': 'bg-yellow-100 text-yellow-800',
      'ITF': 'bg-red-100 text-red-800',
      'CODABAR': 'bg-pink-100 text-pink-800',
    };
    return formatColors[format] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lecture codes-barres</h3>
            <p className="text-sm text-gray-600">
              Détection et lecture de codes-barres et QR codes
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleProcess}
          disabled={isProcessing}
          loading={isProcessing}
          variant="primary"
        >
          {isProcessing ? 'Traitement...' : 'Lire les codes-barres'}
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Recherche de codes-barres...</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Codes-barres trouvés</div>
              <div className="text-2xl font-bold text-gray-900">{result.barcodeCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Dimensions image</div>
              <div className="text-2xl font-bold text-gray-900">
                {result.imageWidth} × {result.imageHeight}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Types détectés</div>
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(result.typeCounts).length}
              </div>
            </div>
          </div>

          {/* Répartition par type */}
          {result.typeCounts && Object.keys(result.typeCounts).length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Répartition par type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(result.typeCounts).map(([format, count]) => (
                  <div key={format} className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl mb-1">{getFormatIcon(format)}</div>
                    <div className="text-sm font-medium text-gray-900">{format}</div>
                    <div className="text-lg font-bold text-gray-700">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des codes-barres détectés */}
          {result.barcodes && result.barcodes.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codes-barres détectés
              </label>
              <div className="space-y-3">
                {result.barcodes.map((barcode: BarcodeInfo, index: number) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getFormatIcon(barcode.format)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(barcode.format)}`}>
                            {barcode.format}
                          </span>
                          <span className="text-sm text-gray-500">
                            Confiance: {Math.round(barcode.confidence * 100)}%
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-sm font-medium text-gray-700 mb-1">Contenu:</div>
                          <div className="font-mono text-sm text-gray-900 break-all">
                            {barcode.text}
                          </div>
                        </div>

                        {barcode.topLeftX !== undefined && barcode.topLeftY !== undefined && (
                          <div className="mt-2 text-xs text-gray-500">
                            Position: ({barcode.topLeftX}, {barcode.topLeftY})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si aucun code-barres trouvé */}
          {result.barcodeCount === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Aucun code-barres détecté</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    Aucun code-barres ou QR code n'a été trouvé dans cette image.
                    Vérifiez que l'image est claire et que les codes-barres sont visibles.
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
