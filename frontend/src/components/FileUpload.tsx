import React, { useState, useCallback, useRef } from 'react';
import type { DocumentUpload } from '../types';
import { Button, Card } from './ui';

interface FileUploadProps {
  onFileSelect: (files: DocumentUpload[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: number; // en MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 10, // 10MB par défaut
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DocumentUpload[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Vérifier la taille du fichier
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Le fichier ${file.name} est trop volumineux. Taille maximale : ${maxFileSize}MB`;
    }

    // Vérifier le type de fichier
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Le type de fichier ${file.type} n'est pas supporté`;
    }

    return null;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const newFiles: DocumentUpload[] = [];
    const newErrors: string[] = [];
    const newProgress: Record<string, number> = {};

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        const documentUpload: DocumentUpload = {
          file,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 'document'
        };
        newFiles.push(documentUpload);
        newProgress[file.name] = 0;
      }
    });

    if (newFiles.length > maxFiles) {
      newErrors.push(`Vous ne pouvez sélectionner que ${maxFiles} fichiers maximum`);
      newFiles.splice(maxFiles);
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setUploadProgress(prev => ({ ...prev, ...newProgress }));
    setErrors(newErrors);

    if (newFiles.length > 0) {
      onFileSelect(newFiles);
    }
  }, [maxFiles, maxFileSize, acceptedTypes, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeFile = useCallback((fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress({});
    setErrors([]);
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-error-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Zone de drag & drop */}
      <Card
        className={`border-2 border-dashed transition-colors duration-200 ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-secondary-300 hover:border-secondary-400'
        }`}
      >
        <div
          className="p-8 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg
            className="mx-auto h-12 w-12 text-secondary-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="mt-4">
            <p className="text-lg font-medium text-secondary-900">
              Glissez et déposez vos fichiers ici
            </p>
            <p className="text-sm text-secondary-600">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
          
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={openFileDialog}
              className="animate-bounce-gentle"
            >
              Sélectionner des fichiers
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-secondary-500">
            <p>Types acceptés : {acceptedTypes.join(', ')}</p>
            <p>Taille maximale : {maxFileSize}MB par fichier</p>
            <p>Maximum : {maxFiles} fichiers</p>
          </div>
        </div>
      </Card>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">
              Fichiers sélectionnés ({selectedFiles.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFiles}
            >
              Tout effacer
            </Button>
          </div>
          
          <div className="space-y-3">
            {selectedFiles.map((fileUpload) => {
              const { file } = fileUpload;
              const progress = uploadProgress[file.name] || 0;
              
              return (
                <div
                  key={file.name}
                  className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg"
                >
                  {getFileIcon(file.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                    
                    {/* Barre de progression */}
                    {progress > 0 && progress < 100 && (
                      <div className="mt-2">
                        <div className="w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-secondary-600 mt-1">
                          {progress}% terminé
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => removeFile(file.name)}
                  >
                    Supprimer
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Erreurs */}
      {errors.length > 0 && (
        <Card>
          <div className="bg-error-50 border border-error-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error-800">
                  Erreurs de validation
                </h3>
                <div className="mt-2 text-sm text-error-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
