import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import FileUpload from '../components/FileUpload';
import { ProcessingOptions as ProcessingOptionsComponent } from '../components/processing/ProcessingOptions';
import { OcrProcessor } from '../components/processing/OcrProcessor';
import { PdfProcessor } from '../components/processing/PdfProcessor';
import { BarcodeProcessor } from '../components/processing/BarcodeProcessor';
import { MrzProcessor } from '../components/processing/MrzProcessor';
import { AiAnalysisProcessor } from '../components/processing/AiAnalysisProcessor';
import { ResultsViewer } from '../components/processing/ResultsViewer';
import { documentApi } from '../services/api';
import type {
  OcrResult,
  PdfResult,
  BarcodeResult,
  MrzResult,
  OllamaResult,
  ProcessingOptions as ProcessingOptionsType,
  ProcessingStep,
  Document
} from '../types';

const ProcessingPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [activeTab, setActiveTab] = useState<'new-file' | 'uploaded-document'>('new-file');
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptionsType>({
    enableOcr: true,
    enablePdf: false,
    enableBarcode: true,
    enableMrz: false,
    enableOllama: true,
  });
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [results, setResults] = useState<{
    ocr?: OcrResult;
    pdf?: PdfResult;
    barcode?: BarcodeResult;
    mrz?: MrzResult;
    ollama?: OllamaResult;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  // Charger les documents uploadés
  const loadUploadedDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await documentApi.getDocuments(0, 20, 'uploadedAt', 'desc');
      setUploadedDocuments(response.content || []);
      console.log('📋 Documents chargés pour traitement:', response.content?.length || 0);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Charger les documents au montage du composant
  useEffect(() => {
    loadUploadedDocuments();
  }, []);

  // Initialiser les étapes de traitement
  const initializeProcessingSteps = () => {
    const steps: ProcessingStep[] = [];
    
    if (processingOptions.enableOcr) {
      steps.push({
        id: 'ocr',
        name: 'Extraction OCR',
        description: 'Extraction de texte depuis l\'image',
        icon: '🔍',
        status: 'pending'
      });
    }
    
    if (processingOptions.enablePdf) {
      steps.push({
        id: 'pdf',
        name: 'Extraction PDF',
        description: 'Extraction de texte et métadonnées du PDF',
        icon: '📄',
        status: 'pending'
      });
    }
    
    if (processingOptions.enableBarcode) {
      steps.push({
        id: 'barcode',
        name: 'Lecture codes-barres',
        description: 'Détection et lecture de codes-barres',
        icon: '📊',
        status: 'pending'
      });
    }
    
    if (processingOptions.enableMrz) {
      steps.push({
        id: 'mrz',
        name: 'Extraction MRZ',
        description: 'Extraction des données d\'identité',
        icon: '🆔',
        status: 'pending'
      });
    }
    
    if (processingOptions.enableOllama) {
      steps.push({
        id: 'ollama',
        name: 'Analyse IA',
        description: 'Analyse intelligente avec Ollama',
        icon: '🤖',
        status: 'pending'
      });
    }
    
    setProcessingSteps(steps);
  };

  // Mettre à jour le statut d'une étape
  const updateStepStatus = (stepId: string, status: ProcessingStep['status'], result?: any, error?: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, error }
        : step
    ));
  };

  // Gérer la sélection de fichier local
  const handleFileSelect = (files: { file: File; type: 'image' | 'pdf' | 'document' }[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0].file);
      setSelectedDocument(null); // Désélectionner le document uploadé
      setResults({});
      initializeProcessingSteps();
    }
  };

  // Gérer la sélection d'un document uploadé
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setSelectedFile(null); // Désélectionner le fichier local
    setResults({});
    initializeProcessingSteps();
  };

  // Gérer les résultats de traitement
  const handleResult = (type: string, result: any) => {
    setResults(prev => ({
      ...prev,
      [type]: result
    }));
    updateStepStatus(type, 'completed', result);
  };

  // Gérer les erreurs de traitement
  const handleError = (type: string, error: string) => {
    updateStepStatus(type, 'error', null, error);
  };

  // Démarrer le traitement
  const handleStartProcessing = () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setCurrentStep(null);
    
    // Réinitialiser les étapes
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    
    // Démarrer le traitement séquentiel
    processSequentially();
  };

  // Traitement séquentiel des étapes
  const processSequentially = async () => {
    for (const step of processingSteps) {
      setCurrentStep(step.id);
      updateStepStatus(step.id, 'processing');
      
      try {
        // Appeler le processeur approprié selon l'étape
        if (step.id === 'ocr' && selectedFile) {
          const response = await documentApi.extractOcr(selectedFile);
          if (response.success && response.data) {
            handleResult('ocr', response.data);
          } else {
            handleError('ocr', response.error || 'Erreur lors du traitement OCR');
          }
        } else if (step.id === 'pdf' && selectedFile && selectedFile.type === 'application/pdf') {
          const response = await documentApi.extractPdf(selectedFile);
          if (response.success && response.data) {
            handleResult('pdf', response.data);
          } else {
            handleError('pdf', response.error || 'Erreur lors du traitement PDF');
          }
        } else if (step.id === 'barcode' && selectedFile && selectedFile.type.startsWith('image/')) {
          const response = await documentApi.readBarcodes(selectedFile);
          if (response.success && response.data) {
            handleResult('barcode', response.data);
          } else {
            handleError('barcode', response.error || 'Erreur lors de la lecture des codes-barres');
          }
        } else if (step.id === 'mrz' && selectedFile && selectedFile.type.startsWith('image/')) {
          const response = await documentApi.extractMrz(selectedFile);
          if (response.success && response.data) {
            handleResult('mrz', response.data);
          } else {
            handleError('mrz', response.error || 'Erreur lors de l\'extraction MRZ');
          }
        } else if (step.id === 'ollama' && selectedFile && selectedFile.type.startsWith('image/')) {
          const response = await documentApi.analyzeWithOllama(selectedFile);
          if (response.success && response.data) {
            handleResult('ollama', response.data);
          } else {
            handleError('ollama', response.error || 'Erreur lors de l\'analyse IA');
          }
        } else {
          // Marquer comme terminé si pas de fichier approprié
          updateStepStatus(step.id, 'completed');
        }
      } catch (error: any) {
        console.error(`Erreur lors du traitement ${step.id}:`, error);
        handleError(step.id, error.message || `Erreur lors du traitement ${step.id}`);
      }
      
      // Délai entre les étapes pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsProcessing(false);
    setCurrentStep(null);
  };

  // Exporter les résultats
  const handleExport = (format: 'json' | 'txt' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `results_${Date.now()}.json`;
      link.click();
    } else if (format === 'txt') {
      let textContent = 'Résultats du traitement de document\n';
      textContent += '=====================================\n\n';
      
      if (results.ocr) {
        textContent += 'OCR:\n';
        textContent += `- Texte extrait: ${results.ocr.text}\n`;
        textContent += `- Confiance: ${Math.round(results.ocr.confidence * 100)}%\n\n`;
      }
      
      if (results.pdf) {
        textContent += 'PDF:\n';
        textContent += `- Pages: ${results.pdf.pageCount}\n`;
        textContent += `- Texte: ${results.pdf.text}\n\n`;
      }
      
      if (results.barcode) {
        textContent += 'Codes-barres:\n';
        results.barcode.barcodes.forEach((barcode, index) => {
          textContent += `- ${index + 1}: ${barcode.format} - ${barcode.text}\n`;
        });
        textContent += '\n';
      }
      
      if (results.mrz) {
        textContent += 'MRZ:\n';
        textContent += `- Type: ${results.mrz.data.documentType}\n`;
        textContent += `- Nom: ${results.mrz.data.surname} ${results.mrz.data.givenNames}\n`;
        textContent += `- Pays: ${results.mrz.data.issuingCountry}\n\n`;
      }
      
      if (results.ollama) {
        textContent += 'Analyse IA:\n';
        textContent += `- Réponse: ${results.ollama.response}\n\n`;
      }
      
      const dataBlob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `results_${Date.now()}.txt`;
      link.click();
    }
  };

  // Réinitialiser le traitement
  const handleReset = () => {
    setSelectedFile(null);
    setSelectedDocument(null);
    setResults({});
    setProcessingSteps([]);
    setIsProcessing(false);
    setCurrentStep(null);
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traitement de Documents</h1>
          <p className="text-gray-600 mt-1">
            Analysez vos documents avec OCR, codes-barres, MRZ et IA
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Retour au Dashboard
          </Link>
        </div>
      </div>

      {/* Section de sélection de document */}
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sélection du document</h2>
          <p className="text-gray-600">Choisissez un fichier local ou un document déjà uploadé</p>
        </div>

        {/* Onglets pour choisir entre fichier local ou document uploadé */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('new-file');
                  setSelectedFile(null);
                  setSelectedDocument(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'new-file'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nouveau fichier
              </button>
              <button
                onClick={() => {
                  setActiveTab('uploaded-document');
                  setSelectedFile(null);
                  setSelectedDocument(null);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'uploaded-document'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Document uploadé
              </button>
            </nav>
          </div>
        </div>

        {/* Section pour nouveau fichier */}
        {activeTab === 'new-file' && (
          <div>
            <FileUpload
              onFileSelect={handleFileSelect}
              maxFiles={1}
              acceptedTypes={['image/*', 'application/pdf']}
              maxFileSize={25}
            />

            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-medium text-gray-900">{selectedFile.name}</div>
                      <div className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Changer de fichier
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section pour documents uploadés */}
        {activeTab === 'uploaded-document' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Documents uploadés</h3>
              <Button 
                onClick={loadUploadedDocuments} 
                variant="outline" 
                size="sm"
                disabled={isLoadingDocuments}
              >
                {isLoadingDocuments ? 'Chargement...' : 'Actualiser'}
              </Button>
            </div>

            {isLoadingDocuments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement des documents...</p>
              </div>
            ) : uploadedDocuments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun document uploadé trouvé</p>
                <p className="text-sm text-gray-400 mt-1">
                  Uploadez d'abord des documents dans l'onglet "Upload"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedDocuments.map((document) => (
                  <div
                    key={document.id}
                    onClick={() => handleDocumentSelect(document)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDocument?.id === document.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {document.fileType?.startsWith('image/') ? '🖼️' : '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {document.fileName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {selectedDocument?.id === document.id && (
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        ✓ Sélectionné pour traitement
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Options de traitement */}
      {(selectedFile || selectedDocument) && (
        <ProcessingOptionsComponent
          options={processingOptions}
          onOptionsChange={setProcessingOptions}
          disabled={isProcessing}
        />
      )}

      {/* Bouton de traitement */}
      {(selectedFile || selectedDocument) && processingSteps.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleStartProcessing}
            disabled={isProcessing}
            loading={isProcessing}
            variant="primary"
            size="lg"
          >
            {isProcessing ? 'Traitement en cours...' : 'Démarrer le traitement'}
          </Button>
        </div>
      )}

      {/* Composants de traitement */}
      {(selectedFile || selectedDocument) && (
        <div className="space-y-6">
          {processingOptions.enableOcr && selectedFile && (
            <OcrProcessor
              file={selectedFile}
              onResult={(result) => handleResult('ocr', result)}
              onError={(error) => handleError('ocr', error)}
            />
          )}

          {processingOptions.enablePdf && selectedFile && selectedFile.type === 'application/pdf' && (
            <PdfProcessor
              file={selectedFile}
              onResult={(result) => handleResult('pdf', result)}
              onError={(error) => handleError('pdf', error)}
            />
          )}

          {processingOptions.enableBarcode && selectedFile && selectedFile.type.startsWith('image/') && (
            <BarcodeProcessor
              file={selectedFile}
              onResult={(result) => handleResult('barcode', result)}
              onError={(error) => handleError('barcode', error)}
            />
          )}

          {processingOptions.enableMrz && selectedFile && selectedFile.type.startsWith('image/') && (
            <MrzProcessor
              file={selectedFile}
              onResult={(result) => handleResult('mrz', result)}
              onError={(error) => handleError('mrz', error)}
            />
          )}

          {processingOptions.enableOllama && selectedFile && selectedFile.type.startsWith('image/') && (
            <AiAnalysisProcessor
              file={selectedFile}
              onResult={(result) => handleResult('ollama', result)}
              onError={(error) => handleError('ollama', error)}
            />
          )}

          {/* Message pour les documents uploadés */}
          {selectedDocument && (
            <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-yellow-600">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Traitement des documents uploadés
                </h3>
                <p className="text-yellow-700">
                  Le traitement des documents uploadés nécessite une implémentation backend spécifique.
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  Document sélectionné : <strong>{selectedDocument.fileName}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visualiseur de résultats */}
      {Object.keys(results).length > 0 && (
        <ResultsViewer
          results={results}
          processingSteps={processingSteps}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default ProcessingPage;
