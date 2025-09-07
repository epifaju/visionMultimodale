import React, { useState } from 'react';
import { documentApi } from '../../services/api';
import type { PdfResult, PageInfo } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PdfProcessorProps {
  file: File;
  onResult: (result: PdfResult) => void;
  onError: (error: string) => void;
}

export const PdfProcessor: React.FC<PdfProcessorProps> = ({
  file,
  onResult,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PdfResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      console.log('📄 Démarrage du traitement PDF pour:', file.name);
      
      // Vérifier l'authentification avant l'appel API
      const token = localStorage.getItem('authToken');
      console.log('🔐 Token JWT présent:', !!token);
      if (token) {
        console.log('🔐 Token JWT (premiers caractères):', token.substring(0, 20) + '...');
        
        // Test d'authentification avant le traitement PDF
        try {
          console.log('🧪 Test d\'authentification...');
          const authTest = await documentApi.testAuthPost();
          console.log('✅ Test d\'authentification réussi:', authTest);
        } catch (authError: any) {
          console.error('❌ Test d\'authentification échoué:', authError);
          if (authError.response?.status === 403) {
            onError('Session expirée. Veuillez vous reconnecter.');
            return;
          }
        }
      } else {
        console.warn('⚠️ Aucun token JWT trouvé dans localStorage');
        onError('Vous devez être connecté pour traiter des fichiers PDF');
        return;
      }
      
      const response = await documentApi.extractPdf(file);
      
      if (response.success && response.data) {
        const pdfResult: PdfResult = response.data;
        setResult(pdfResult);
        onResult(pdfResult);
        
        console.log('✅ PDF traité avec succès:', {
          pageCount: pdfResult.pageCount,
          textLength: pdfResult.text.length,
          language: pdfResult.detectedLanguage
        });
      } else {
        throw new Error(response.error || 'Erreur lors du traitement PDF');
      }
    } catch (error: any) {
      console.error('❌ Erreur PDF:', error);
      onError(error.message || 'Erreur lors du traitement PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Extraction PDF</h3>
            <p className="text-sm text-gray-600">
              Extraction de texte et métadonnées depuis le PDF
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleProcess}
          disabled={isProcessing}
          loading={isProcessing}
          variant="primary"
        >
          {isProcessing ? 'Traitement...' : 'Extraire le PDF'}
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Extraction du PDF en cours...</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Pages</div>
              <div className="text-2xl font-bold text-gray-900">{result.pageCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Taille</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(result.fileSize)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Caractères</div>
              <div className="text-2xl font-bold text-gray-900">{result.text.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Langue</div>
              <div className="text-2xl font-bold text-gray-900">{result.detectedLanguage}</div>
            </div>
          </div>

          {/* Informations sur le contenu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">
                  {result.hasText ? '✅' : '❌'}
                </span>
                <span className="text-sm font-medium text-blue-800">
                  {result.hasText ? 'Contient du texte' : 'Pas de texte'}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">
                  {result.hasImages ? '✅' : '❌'}
                </span>
                <span className="text-sm font-medium text-green-800">
                  {result.hasImages ? 'Contient des images' : 'Pas d\'images'}
                </span>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Métadonnées du PDF
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.metadata).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {value ? String(value) : 'Non disponible'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Informations par page */}
          {result.pages && result.pages.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informations par page
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.pages.map((page: PageInfo) => (
                    <div key={page.pageNumber} className="bg-white p-3 rounded border">
                      <div className="text-sm font-medium text-gray-900">
                        Page {page.pageNumber + 1}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {page.width} × {page.height}px
                      </div>
                      <div className="text-xs text-gray-500">
                        {page.textLength} caractères
                      </div>
                      <div className="text-xs text-gray-500">
                        {page.hasText ? 'Avec texte' : 'Sans texte'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Texte extrait */}
          {result.text && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte extrait
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-900">
                  {result.text}
                </pre>
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
