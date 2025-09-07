import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { User, Document, ProcessingResult } from './types';
import {
  NavigationBar,
  AuthPage,
  FileUpload,
  ResultsViewer,
  Dashboard,
  DocumentsPage,
  UploadPage,
} from './components';
import ProcessingPage from './pages/ProcessingPage';
import { NotificationContainer, ErrorBoundary } from './components/ui';
import { useAuthStore, useDocumentStore, useUIStore } from './stores';
import { useAppInitialization } from './hooks';
import './App.css';

// Données de démonstration
const mockUser: User = {
  id: 1,
  username: 'demo_user',
  email: 'demo@example.com',
  role: 'USER',
  firstName: 'Demo',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

const mockDocuments: Document[] = [
  {
    id: 1,
    fileName: 'document_test.pdf',
    originalFileName: 'document_test.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1024 * 2.5, // 2.5MB
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 jour ago
    processedAt: new Date().toISOString(),
    status: 'COMPLETED',
    uploadedById: 1,
    uploadedByUsername: 'demo_user',
    updatedAt: new Date().toISOString(),
    extractedText: 'Ceci est un texte extrait du document PDF de test.',
    metadata: '{"pages": 5, "author": "Test Author", "title": "Document de Test"}',
  },
  {
    id: 2,
    fileName: 'image_ocr.jpg',
    originalFileName: 'image_ocr.jpg',
    fileType: 'image/jpeg',
    fileSize: 1024 * 512, // 512KB
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 heures ago
    processedAt: new Date().toISOString(),
    status: 'COMPLETED',
    uploadedById: 1,
    uploadedByUsername: 'demo_user',
    updatedAt: new Date().toISOString(),
    extractedText: 'Texte extrait de l\'image par OCR.',
  },
  {
    id: 3,
    fileName: 'barcode_scan.png',
    originalFileName: 'barcode_scan.png',
    fileType: 'image/png',
    fileSize: 1024 * 256, // 256KB
    uploadedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    status: 'PROCESSING',
    uploadedById: 1,
    uploadedByUsername: 'demo_user',
    updatedAt: new Date().toISOString(),
  },
];

const mockResults: ProcessingResult[] = [
  {
    documentId: 1,
    processingTime: 1200,
    ocrResult: {
      text: 'Ceci est un texte extrait du document PDF de test.',
      confidence: 95,
      language: 'fra',
    },
    pdfResult: {
      pageCount: 5,
      text: 'Ceci est un texte extrait du document PDF de test.',
      metadata: {
        pages: '5',
        author: 'Test Author',
        title: 'Document de Test',
      },
    },
  },
  {
    documentId: 2,
    processingTime: 800,
    ocrResult: {
      text: 'Texte extrait de l\'image par OCR.',
      confidence: 87,
      language: 'fra',
    },
  },
  {
    documentId: 3,
    processingTime: 150,
    barcodeResult: {
      barcodes: [{
        type: 'QR Code',
        data: 'https://example.com/test',
        format: 'QR',
      }],
    },
  },
];

// Composant pour les routes protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Composant principal de l'application
const AppContent: React.FC = () => {
  const { user: authUser, logout } = useAuthStore();
  const { currentDocument, setCurrentDocument, loadDocuments } = useDocumentStore();
  const { currentView, setCurrentView, isLoading } = useUIStore();
  
  // Initialiser l'application
  useAppInitialization();
  
  // État local pour la compatibilité
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    try {
      // La connexion est gérée par le store d'authentification
      setCurrentView('dashboard');
      // Charger les documents après connexion
      await loadDocuments();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
    setSelectedDocument(null);
  };

  const handleFileSelect = (files: any[]) => {
    console.log('Fichiers sélectionnés:', files);
    // Ici, vous pourriez envoyer les fichiers au backend
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setCurrentView('results');
  };

  const handleUploadClick = () => {
    setCurrentView('upload');
  };

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    console.log(`Export en format ${format}`);
    // Ici, vous pourriez implémenter l'export
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <NavigationBar user={authUser || mockUser} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && (
          <Dashboard
            documents={mockDocuments}
            onDocumentSelect={handleDocumentSelect}
            onUploadClick={handleUploadClick}
          />
        )}
        
        {currentView === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">Upload de documents</h1>
                <p className="text-secondary-600 mt-1">
                  Téléchargez vos documents pour traitement
                </p>
              </div>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Retour au dashboard
              </button>
            </div>
            
            <FileUpload
              onFileSelect={handleFileSelect}
              maxFiles={10}
              acceptedTypes={['image/*', 'application/pdf', 'text/*']}
              maxFileSize={25}
            />
          </div>
        )}
        
        {currentView === 'results' && selectedDocument && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">Résultats du traitement</h1>
                <p className="text-secondary-600 mt-1">
                  Détails du document et résultats extraits
                </p>
              </div>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Retour au dashboard
              </button>
            </div>
            
            <ResultsViewer
              document={selectedDocument}
              results={mockResults.filter(r => r.documentId === selectedDocument.id)}
              onExport={handleExport}
            />
          </div>
        )}
      </main>
      
      {/* Conteneur de notifications */}
      <NotificationContainer />
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuthStore();

  // Si l'utilisateur n'est pas connecté, afficher la page d'authentification
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthPage 
          onLogin={async () => {}}
          onRegister={async () => {}}
        />
      </ErrorBoundary>
    );
  }

  // Rendu principal de l'application avec routage
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-secondary-50">
                <NavigationBar user={mockUser} onLogout={() => {}} />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <DocumentsPage onDocumentSelect={(doc) => console.log('Document sélectionné:', doc)} />
                </main>
                <NotificationContainer />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-secondary-50">
                <NavigationBar user={mockUser} onLogout={() => {}} />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <UploadPage />
                </main>
                <NotificationContainer />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/processing" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-secondary-50">
                <NavigationBar user={mockUser} onLogout={() => {}} />
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                  <ProcessingPage />
                </main>
                <NotificationContainer />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
