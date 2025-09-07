import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentApi } from '../services/api';
import { Button, Card, LoadingSpinner } from '../components/ui';
import FileUpload from '../components/FileUpload';
import type { Document, DocumentUpload, PaginatedResponse } from '../types';

const UploadPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('uploadedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Charger les documents
  const loadDocuments = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        page: number;
        size: number;
        sortBy: string;
        sortDir: 'asc' | 'desc';
        status?: string;
        fileType?: string;
        searchQuery?: string;
      } = {
        page,
        size: 20,
        sortBy,
        sortDir,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (fileTypeFilter !== 'all') {
        params.fileType = fileTypeFilter;
      }

      if (searchQuery.trim()) {
        params.searchQuery = searchQuery.trim();
      }

      const response: PaginatedResponse<Document> = await documentApi.getDocuments(params);
      
      setDocuments(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.currentPage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des documents';
      setError(errorMessage);
      console.error('Erreur lors du chargement des documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les documents au montage et lors des changements de filtres
  useEffect(() => {
    loadDocuments(0);
  }, [statusFilter, fileTypeFilter, sortBy, sortDir]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadDocuments(0);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadDocuments(page);
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = async (files: DocumentUpload[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadSuccess([]);
    const successFiles: string[] = [];

    try {
      for (const fileUpload of files) {
        try {
          await documentApi.processDocument(fileUpload.file);
          successFiles.push(fileUpload.file.name);
        } catch (err) {
          console.error(`Erreur lors de l'upload de ${fileUpload.file.name}:`, err);
        }
      }

      if (successFiles.length > 0) {
        setUploadSuccess(successFiles);
        // Recharger la liste des documents après upload réussi
        setTimeout(() => {
          loadDocuments(0);
        }, 1000);
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
    } finally {
      setUploading(false);
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtenir la couleur du statut
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
      case 'PROCESSED':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED':
        return (
          <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'PROCESSING':
        return (
          <svg className="w-5 h-5 text-primary-500 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'PENDING':
        return (
          <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'ERROR':
        return (
          <svg className="w-5 h-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Upload et Gestion des Documents</h1>
          <p className="text-secondary-600 mt-1">
            Téléchargez de nouveaux documents et gérez votre bibliothèque
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-secondary-600">
            {totalElements} document{totalElements !== 1 ? 's' : ''} au total
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            ← Retour au Dashboard
          </Link>
        </div>
      </div>

      {/* Section d'upload */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Upload de nouveaux documents</h2>
          <p className="text-secondary-600">Sélectionnez vos fichiers pour traitement automatique</p>
        </div>
        
        <FileUpload
          onFileSelect={handleFileSelect}
          maxFiles={10}
          acceptedTypes={['image/*', 'application/pdf', 'text/*']}
          maxFileSize={25}
        />

        {/* Indicateur d'upload */}
        {uploading && (
          <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-primary-700">Upload en cours...</span>
            </div>
          </div>
        )}

        {/* Messages de succès */}
        {uploadSuccess.length > 0 && (
          <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-success-700">
                {uploadSuccess.length} fichier(s) uploadé(s) avec succès !
              </span>
            </div>
            <ul className="mt-2 text-sm text-success-600 list-disc list-inside">
              {uploadSuccess.map((fileName, index) => (
                <li key={index}>{fileName}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Section de gestion des documents */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Documents uploadés</h2>
          <p className="text-secondary-600">Gérez et consultez tous vos documents traités</p>
        </div>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PROCESSING">En cours</option>
              <option value="COMPLETED">Terminés</option>
              <option value="PROCESSED">Traités</option>
              <option value="ERROR">Erreurs</option>
            </select>
          </div>

          {/* Filtre par type de fichier */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Type de fichier
            </label>
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              <option value="application/pdf">PDF</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/tiff">TIFF</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="uploadedAt">Date d'upload</option>
              <option value="fileName">Nom du fichier</option>
              <option value="fileSize">Taille</option>
              <option value="status">Statut</option>
            </select>
          </div>

          {/* Direction du tri */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Ordre
            </label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Recherche
          </label>
          <input
            type="text"
            placeholder="Rechercher dans le contenu des documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 border border-error-200 bg-error-50 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-error-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-error-700">{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDocuments(currentPage)}
                className="ml-auto"
              >
                Réessayer
              </Button>
            </div>
          </div>
        )}

        {/* Liste des documents */}
        {loading && documents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-secondary-900">Aucun document</h3>
            <p className="mt-1 text-sm text-secondary-500">
              {searchQuery || statusFilter !== 'all' || fileTypeFilter !== 'all'
                ? 'Aucun document ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore uploadé de documents.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Taille
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date d'upload
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      className="hover:bg-secondary-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">
                              {document.fileName}
                            </div>
                            <div className="text-sm text-secondary-500">
                              ID: {document.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {document.fileType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {formatFileSize(document.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(document.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                            {document.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {formatDate(document.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Voir document:', document)}
                          >
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Télécharger document:', document)}
                          >
                            Télécharger
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-secondary-700">
                  Page {currentPage + 1} sur {totalPages} ({totalElements} document{totalElements !== 1 ? 's' : ''})
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                  >
                    Première
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Précédente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Suivante
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Dernière
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Indicateur de chargement */}
        {loading && documents.length > 0 && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadPage;





