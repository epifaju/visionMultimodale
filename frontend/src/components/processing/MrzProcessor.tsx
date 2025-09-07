import React, { useState } from 'react';
import { documentApi } from '../../services/api';
import type { MrzResult, MrzData } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MrzProcessorProps {
  file: File;
  onResult: (result: MrzResult) => void;
  onError: (error: string) => void;
}

export const MrzProcessor: React.FC<MrzProcessorProps> = ({
  file,
  onResult,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MrzResult | null>(null);

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      console.log('🆔 Démarrage du traitement MRZ pour:', file.name);
      
      const response = await documentApi.extractMrz(file);
      
      if (response.success && response.data) {
        const mrzResult: MrzResult = response.data;
        setResult(mrzResult);
        onResult(mrzResult);
        
        console.log('✅ MRZ traité avec succès:', {
          documentType: mrzResult.data.documentType,
          country: mrzResult.data.issuingCountry
        });
      } else {
        throw new Error(response.error || 'Erreur lors du traitement MRZ');
      }
    } catch (error: any) {
      console.error('❌ Erreur MRZ:', error);
      onError(error.message || 'Erreur lors du traitement MRZ');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocumentTypeIcon = (type: string): string => {
    const typeIcons: Record<string, string> = {
      'PASSPORT': '📘',
      'ID_CARD': '🆔',
      'UNKNOWN': '❓',
    };
    return typeIcons[type] || '❓';
  };

  const getDocumentTypeColor = (type: string): string => {
    const typeColors: Record<string, string> = {
      'PASSPORT': 'bg-blue-100 text-blue-800',
      'ID_CARD': 'bg-green-100 text-green-800',
      'UNKNOWN': 'bg-gray-100 text-gray-800',
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === 'Unknown') return 'Non disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🆔</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Extraction MRZ</h3>
            <p className="text-sm text-gray-600">
              Extraction des données d'identité depuis la zone MRZ
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleProcess}
          disabled={isProcessing}
          loading={isProcessing}
          variant="primary"
        >
          {isProcessing ? 'Traitement...' : 'Extraire MRZ'}
        </Button>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Extraction des données MRZ...</span>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Type de document */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getDocumentTypeIcon(result.data.documentType)}</span>
              <div>
                <div className="text-sm font-medium text-gray-500">Type de document</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getDocumentTypeColor(result.data.documentType)}`}>
                  {result.data.documentType === 'PASSPORT' ? 'Passeport' : 
                   result.data.documentType === 'ID_CARD' ? 'Carte d\'identité' : 
                   'Type inconnu'}
                </div>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Informations personnelles</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Nom de famille</dt>
                  <dd className="text-sm text-gray-900">{result.data.surname || 'Non disponible'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Prénoms</dt>
                  <dd className="text-sm text-gray-900">{result.data.givenNames || 'Non disponible'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Date de naissance</dt>
                  <dd className="text-sm text-gray-900">{formatDate(result.data.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Sexe</dt>
                  <dd className="text-sm text-gray-900">
                    {result.data.gender === 'MALE' ? 'Masculin' : 
                     result.data.gender === 'FEMALE' ? 'Féminin' : 
                     'Non spécifié'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Informations du document</h4>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Numéro de document</dt>
                  <dd className="text-sm text-gray-900 font-mono">{result.data.documentNumber || 'Non disponible'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Pays émetteur</dt>
                  <dd className="text-sm text-gray-900">{result.data.issuingCountry || 'Non disponible'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Nationalité</dt>
                  <dd className="text-sm text-gray-900">{result.data.nationality || 'Non disponible'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Date d'expiration</dt>
                  <dd className="text-sm text-gray-900">{formatDate(result.data.expiryDate)}</dd>
                </div>
                {result.data.personalNumber && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Numéro personnel</dt>
                    <dd className="text-sm text-gray-900 font-mono">{result.data.personalNumber}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Texte MRZ brut */}
          {result.mrzText && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte MRZ brut
              </label>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{result.mrzText}</pre>
              </div>
            </div>
          )}

          {/* Message si aucune donnée MRZ trouvée */}
          {!result.data.documentNumber && !result.data.surname && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Aucune donnée MRZ détectée</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    Aucune zone MRZ valide n'a été trouvée dans cette image.
                    Vérifiez que l'image contient bien un document d'identité avec une zone MRZ visible.
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
