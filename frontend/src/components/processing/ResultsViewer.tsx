import React, { useState } from 'react';
import type { 
  OcrResult, 
  PdfResult, 
  BarcodeResult, 
  MrzResult, 
  OllamaResult
} from '../../types';
import type { ProcessingStep } from '../../types';
// Card component available but not used in current implementation
import Button from '../ui/Button';

interface ResultsViewerProps {
  results: {
    ocr?: OcrResult;
    pdf?: PdfResult;
    barcode?: BarcodeResult;
    mrz?: MrzResult;
    ollama?: OllamaResult;
  };
  processingSteps: ProcessingStep[];
  onExport?: (format: 'json' | 'txt' | 'csv') => void;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({
  results,
  processingSteps,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  // expandedSections state available for future expandable sections

  // toggleSection function available for future expandable sections

  const getTabCount = () => {
    let count = 0;
    if (results.ocr) count++;
    if (results.pdf) count++;
    if (results.barcode) count++;
    if (results.mrz) count++;
    if (results.ollama) count++;
    return count;
  };

  const getSuccessCount = () => {
    let count = 0;
    if (results.ocr?.success) count++;
    if (results.pdf?.success) count++;
    if (results.barcode?.success) count++;
    if (results.mrz?.success) count++;
    if (results.ollama?.success) count++;
    return count;
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
    { id: 'ocr', name: 'OCR', icon: '🔍', count: results.ocr ? 1 : 0 },
    { id: 'pdf', name: 'PDF', icon: '📄', count: results.pdf ? 1 : 0 },
    { id: 'barcode', name: 'Codes-barres', icon: '📊', count: results.barcode ? 1 : 0 },
    { id: 'mrz', name: 'MRZ', icon: '🆔', count: results.mrz ? 1 : 0 },
    { id: 'ollama', name: 'IA', icon: '🤖', count: results.ollama ? 1 : 0 },
  ].filter(tab => tab.id === 'overview' || (tab.count && tab.count > 0));

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600">Traitements effectués</div>
          <div className="text-2xl font-bold text-blue-900">{getTabCount()}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600">Succès</div>
          <div className="text-2xl font-bold text-green-900">{getSuccessCount()}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-yellow-600">En cours</div>
          <div className="text-2xl font-bold text-yellow-900">
            {processingSteps.filter(step => step.status === 'processing').length}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-red-600">Erreurs</div>
          <div className="text-2xl font-bold text-red-900">
            {processingSteps.filter(step => step.status === 'error').length}
          </div>
        </div>
      </div>

      {/* Liste des étapes de traitement */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Étapes de traitement</h3>
        <div className="space-y-3">
          {processingSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                step.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : step.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : step.status === 'processing'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{step.name}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {step.status === 'completed' && (
                  <span className="text-green-600">✅</span>
                )}
                {step.status === 'error' && (
                  <span className="text-red-600">❌</span>
                )}
                {step.status === 'processing' && (
                  <span className="text-yellow-600">⏳</span>
                )}
                {step.status === 'pending' && (
                  <span className="text-gray-400">⏸️</span>
                )}
                <span className="text-sm text-gray-500 capitalize">
                  {step.status === 'completed' ? 'Terminé' :
                   step.status === 'error' ? 'Erreur' :
                   step.status === 'processing' ? 'En cours' : 'En attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé des résultats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des résultats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.ocr && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">🔍</span>
                <span className="font-medium text-gray-900">OCR</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  results.ocr.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {results.ocr.success ? 'Succès' : 'Erreur'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {results.ocr.success ? (
                  `${results.ocr.textLength} caractères extraits (${Math.round(results.ocr.confidence * 100)}% confiance)`
                ) : (
                  results.ocr.errorMessage
                )}
              </div>
            </div>
          )}

          {results.pdf && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">📄</span>
                <span className="font-medium text-gray-900">PDF</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  results.pdf.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {results.pdf.success ? 'Succès' : 'Erreur'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {results.pdf.success ? (
                  `${results.pdf.pageCount} pages, ${results.pdf.text.length} caractères`
                ) : (
                  results.pdf.errorMessage
                )}
              </div>
            </div>
          )}

          {results.barcode && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">📊</span>
                <span className="font-medium text-gray-900">Codes-barres</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  results.barcode.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {results.barcode.success ? 'Succès' : 'Erreur'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {results.barcode.success ? (
                  `${results.barcode.barcodeCount} codes-barres trouvés`
                ) : (
                  results.barcode.errorMessage
                )}
              </div>
            </div>
          )}

          {results.mrz && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">🆔</span>
                <span className="font-medium text-gray-900">MRZ</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  results.mrz.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {results.mrz.success ? 'Succès' : 'Erreur'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {results.mrz.success ? (
                  `${results.mrz.data.documentType} - ${results.mrz.data.issuingCountry}`
                ) : (
                  results.mrz.errorMessage
                )}
              </div>
            </div>
          )}

          {results.ollama && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">🤖</span>
                <span className="font-medium text-gray-900">IA</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  results.ollama.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {results.ollama.success ? 'Succès' : 'Erreur'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {results.ollama.success ? (
                  `${results.ollama.response.length} caractères de réponse`
                ) : (
                  results.ollama.errorMessage
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ocr':
        return results.ocr ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Caractères extraits</div>
                <div className="text-2xl font-bold text-gray-900">{results.ocr.textLength}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Confiance</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(results.ocr.confidence * 100)}%
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Langue</div>
                <div className="text-2xl font-bold text-gray-900">{results.ocr.language}</div>
              </div>
            </div>
            {results.ocr.text && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte extrait
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">
                    {results.ocr.text}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : null;

      case 'pdf':
        return results.pdf ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Pages</div>
                <div className="text-2xl font-bold text-gray-900">{results.pdf.pageCount}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Caractères</div>
                <div className="text-2xl font-bold text-gray-900">{results.pdf.text.length}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Langue</div>
                <div className="text-2xl font-bold text-gray-900">{results.pdf.detectedLanguage}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Images</div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.pdf.hasImages ? 'Oui' : 'Non'}
                </div>
              </div>
            </div>
            {results.pdf.text && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte extrait
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900">
                    {results.pdf.text}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : null;

      case 'barcode':
        return results.barcode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Codes-barres trouvés</div>
                <div className="text-2xl font-bold text-gray-900">{results.barcode.barcodeCount}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Types détectés</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(results.barcode.typeCounts).length}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Dimensions</div>
                <div className="text-2xl font-bold text-gray-900">
                  {results.barcode.imageWidth} × {results.barcode.imageHeight}
                </div>
              </div>
            </div>
            {results.barcode.barcodes && results.barcode.barcodes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codes-barres détectés
                </label>
                <div className="space-y-2">
                  {results.barcode.barcodes.map((barcode, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{barcode.format}</span>
                        <span className="text-sm text-gray-500">
                          Confiance: {Math.round(barcode.confidence * 100)}%
                        </span>
                      </div>
                      <div className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {barcode.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null;

      case 'mrz':
        return results.mrz ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Informations personnelles</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Nom</dt>
                    <dd className="text-sm text-gray-900">
                      {results.mrz.data.surname} {results.mrz.data.givenNames}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Date de naissance</dt>
                    <dd className="text-sm text-gray-900">{results.mrz.data.dateOfBirth}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Sexe</dt>
                    <dd className="text-sm text-gray-900">{results.mrz.data.gender}</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Informations du document</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900">{results.mrz.data.documentType}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Pays émetteur</dt>
                    <dd className="text-sm text-gray-900">{results.mrz.data.issuingCountry}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Numéro</dt>
                    <dd className="text-sm text-gray-900 font-mono">{results.mrz.data.documentNumber}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        ) : null;

      case 'ollama':
        return results.ollama ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Modèle</div>
                <div className="text-lg font-bold text-gray-900">{results.ollama.model}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Longueur de réponse</div>
                <div className="text-lg font-bold text-gray-900">{results.ollama.response.length}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Statut</div>
                <div className="text-lg font-bold text-gray-900">
                  {results.ollama.done ? 'Terminé' : 'En cours'}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réponse de l'IA
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-900">
                  {results.ollama.response}
                </pre>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec options d'export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Résultats du traitement</h2>
          <p className="text-sm text-gray-600">
            {getSuccessCount()} sur {getTabCount()} traitements réussis
          </p>
        </div>
        {onExport && (
          <div className="flex space-x-2">
            <Button onClick={() => onExport('json')} variant="outline" size="sm">
              Export JSON
            </Button>
            <Button onClick={() => onExport('txt')} variant="outline" size="sm">
              Export TXT
            </Button>
            <Button onClick={() => onExport('csv')} variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.count && tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};
