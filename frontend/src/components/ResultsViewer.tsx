import React, { useState } from 'react';
import type { ProcessingResult, Document } from '../types';
import { Button, Card } from './ui';

interface ResultsViewerProps {
  document: Document;
  results: ProcessingResult[];
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({
  document,
  results,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedResult, setSelectedResult] = useState<ProcessingResult | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success-100 text-success-800';
      case 'PROCESSING':
        return 'bg-primary-100 text-primary-800';
      case 'PENDING':
        return 'bg-secondary-100 text-secondary-800';
      case 'ERROR':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'ocr':
        return (
          <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-error-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'barcode':
        return (
          <svg className="w-6 h-6 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'mrz':
        return (
          <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatProcessingTime = (time: number): string => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const renderResultContent = (result: ProcessingResult) => {
    switch (result.type) {
      case 'ocr':
        return (
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-2">Texte extrait :</h4>
              <p className="text-secondary-700 whitespace-pre-wrap">{result.result.text}</p>
            </div>
            {result.confidence && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">Confiance :</span>
                <div className="flex-1 bg-secondary-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-secondary-900">{result.confidence}%</span>
              </div>
            )}
          </div>
        );
      
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-2">Contenu extrait :</h4>
              <p className="text-secondary-700 whitespace-pre-wrap">{result.result.content}</p>
            </div>
            {result.result.metadata && (
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-2">Métadonnées :</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(result.result.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-secondary-600">{key}:</span>
                      <span className="text-secondary-900 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'barcode':
        return (
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-2">Code détecté :</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Type :</span>
                  <span className="text-secondary-900 font-medium">{result.result.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Valeur :</span>
                  <span className="text-secondary-900 font-medium break-all">{result.result.value}</span>
                </div>
                {result.confidence && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Confiance :</span>
                    <span className="text-secondary-900 font-medium">{result.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'mrz':
        return (
          <div className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-2">Informations MRZ :</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Nom :</span>
                  <span className="text-secondary-900 font-medium">{result.result.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Prénom :</span>
                  <span className="text-secondary-900 font-medium">{result.result.firstName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Date de naissance :</span>
                  <span className="text-secondary-900 font-medium">{result.result.dateOfBirth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Numéro de document :</span>
                  <span className="text-secondary-900 font-medium">{result.result.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Date d'expiration :</span>
                  <span className="text-secondary-900 font-medium">{result.result.expiryDate}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-secondary-50 p-4 rounded-lg">
            <pre className="text-sm text-secondary-700 overflow-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
    { id: 'ocr', name: 'OCR', icon: '📝' },
    { id: 'pdf', name: 'PDF', icon: '📄' },
    { id: 'barcode', name: 'Codes-barres', icon: '📱' },
    { id: 'mrz', name: 'MRZ', icon: '🆔' },
  ].filter(tab => results.some(r => r.type === tab.id) || tab.id === 'overview');

  return (
    <div className="space-y-6">
      {/* En-tête du document */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">{document.fileName}</h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-600">
              <span>Type : {document.fileType}</span>
              <span>Taille : {(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              <span>Uploadé le : {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
              {document.status}
            </span>
            {onExport && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => onExport('json')}
                >
                  Exporter
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Onglets de navigation */}
      <Card padding="none">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Contenu des onglets */}
      <Card>
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Résultats de traitement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((result) => (
                  <div
                    key={`${result.documentId}-${result.type}`}
                    className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200 cursor-pointer"
                    onClick={() => setSelectedResult(result)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {getResultIcon(result.type)}
                      <div>
                        <h4 className="font-medium text-secondary-900 capitalize">{result.type}</h4>
                        <p className="text-sm text-secondary-500">
                          {formatProcessingTime(result.processingTime)}
                        </p>
                      </div>
                    </div>
                    {result.confidence && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-secondary-600">Confiance :</span>
                        <div className="flex-1 bg-secondary-200 rounded-full h-1">
                          <div
                            className="bg-primary-600 h-1 rounded-full"
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-secondary-900">{result.confidence}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Résultats {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            {results
              .filter(result => result.type === activeTab)
              .map((result) => (
                <div key={`${result.documentId}-${result.type}`} className="space-y-4">
                  {renderResultContent(result)}
                  <div className="flex items-center justify-between text-sm text-secondary-500">
                    <span>Temps de traitement : {formatProcessingTime(result.processingTime)}</span>
                    {result.confidence && (
                      <span>Confiance : {result.confidence}%</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Modal de détail du résultat */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">
                Détail du résultat {selectedResult.type.toUpperCase()}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResult(null)}
              >
                Fermer
              </Button>
            </div>
            {renderResultContent(selectedResult)}
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex items-center justify-between text-sm text-secondary-500">
                <span>Temps de traitement : {formatProcessingTime(selectedResult.processingTime)}</span>
                {selectedResult.confidence && (
                  <span>Confiance : {selectedResult.confidence}%</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResultsViewer;
