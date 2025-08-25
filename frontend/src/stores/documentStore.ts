import { create } from 'zustand'
import { documentApi } from '../services/api'
import type { Document, ProcessingResult, DocumentFilters, ProcessingStatus } from '@/types'

export interface DocumentState {
  // État
  documents: Document[]
  currentDocument: Document | null
  processingQueue: Document[]
  processingResults: Map<number, ProcessingResult>
  filters: DocumentFilters
  isLoading: boolean
  error: string | null
  
  // Pagination
  currentPage: number
  totalPages: number
  totalElements: number
  
  // Actions
  addDocument: (document: Document) => void
  updateDocument: (id: number, updates: Partial<Document>) => void
  removeDocument: (id: number) => void
  setCurrentDocument: (document: Document | null) => void
  addToProcessingQueue: (document: Document) => void
  removeFromProcessingQueue: (id: number) => void
  setProcessingResult: (documentId: number, result: ProcessingResult) => void
  updateProcessingStatus: (documentId: number, status: ProcessingStatus) => void
  setFilters: (filters: Partial<DocumentFilters>) => void
  clearFilters: () => void
  clearError: () => void
  loadDocuments: (params?: {
    page?: number
    size?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
    status?: string
    fileType?: string
    searchQuery?: string
  }) => Promise<void>
  processDocument: (documentId: number) => Promise<ProcessingResult>
  searchDocuments: (query: string) => Document[]
  getDocumentsByStatus: (status: ProcessingStatus) => Document[]
  getDocumentsByType: (type: string) => Document[]
  getDocumentsByDateRange: (startDate: Date, endDate: Date) => Document[]
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // État initial
  documents: [],
  currentDocument: null,
  processingQueue: [],
  processingResults: new Map(),
  filters: {
    status: null,
    type: null,
    dateFrom: null,
    dateTo: null,
    searchQuery: ''
  },
  isLoading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,

  // Action d'ajout de document
  addDocument: (document: Document) => {
    set((state) => ({
      documents: [document, ...state.documents]
    }))
  },

  // Action de mise à jour de document
  updateDocument: (id: number, updates: Partial<Document>) => {
    set((state) => ({
      documents: state.documents.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      ),
      currentDocument: state.currentDocument?.id === id 
        ? { ...state.currentDocument, ...updates }
        : state.currentDocument
    }))
  },

  // Action de suppression de document
  removeDocument: (id: number) => {
    set((state) => ({
      documents: state.documents.filter(doc => doc.id !== id),
      currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
      processingResults: new Map(
        Array.from(state.processingResults.entries()).filter(([docId]) => docId !== id)
      )
    }))
  },

  // Action de définition du document courant
  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document })
  },

  // Action d'ajout à la queue de traitement
  addToProcessingQueue: (document: Document) => {
    set((state) => ({
      processingQueue: [...state.processingQueue, document]
    }))
  },

  // Action de suppression de la queue de traitement
  removeFromProcessingQueue: (id: number) => {
    set((state) => ({
      processingQueue: state.processingQueue.filter(doc => doc.id !== id)
    }))
  },

  // Action de définition du résultat de traitement
  setProcessingResult: (documentId: number, result: ProcessingResult) => {
    set((state) => {
      const newResults = new Map(state.processingResults)
      newResults.set(documentId, result)
      return { processingResults: newResults }
    })
  },

  // Action de mise à jour du statut de traitement
  updateProcessingStatus: (documentId: number, status: ProcessingStatus) => {
    set((state) => ({
      documents: state.documents.map(doc => 
        doc.id === documentId ? { ...doc, status } : doc
      ),
      currentDocument: state.currentDocument?.id === documentId 
        ? { ...state.currentDocument, status }
        : state.currentDocument
    }))
  },

  // Action de définition des filtres
  setFilters: (filters: Partial<DocumentFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  // Action de nettoyage des filtres
  clearFilters: () => {
    set({
      filters: {
        status: null,
        type: null,
        dateFrom: null,
        dateTo: null,
        searchQuery: ''
      }
    })
  },

  // Action de nettoyage des erreurs
  clearError: () => set({ error: null }),

  // Action de chargement des documents depuis l'API
  loadDocuments: async (params = {}) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await documentApi.getDocuments({
        page: params.page || 0,
        size: params.size || 20,
        sortBy: params.sortBy || 'uploadedAt',
        sortDir: params.sortDir || 'desc',
        status: params.status,
        fileType: params.fileType,
        searchQuery: params.searchQuery
      })

      set({
        documents: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement des documents'
      set({ isLoading: false, error: errorMessage })
      console.error('Erreur lors du chargement des documents:', error)
    }
  },

  // Action de traitement de document
  processDocument: async (documentId: number): Promise<ProcessingResult> => {
    const { documents } = get()
    const document = documents.find(doc => doc.id === documentId)
    
    if (!document) {
      throw new Error('Document non trouvé')
    }

    // Mettre à jour le statut
    get().updateProcessingStatus(documentId, 'PROCESSING')

    try {
      // Simulation de traitement - à remplacer par l'appel réel
      const result: ProcessingResult = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            documentId,
            processingTime: Math.random() * 5000 + 1000,
            ocrResult: {
              text: 'Texte extrait par OCR...',
              confidence: 0.95,
              language: 'fr'
            },
            pdfResult: document.fileType === 'application/pdf' ? {
              pageCount: 3,
              text: 'Contenu PDF extrait...',
              metadata: {
                title: 'Document PDF',
                author: 'Auteur',
                subject: 'Sujet'
              }
            } : null,
            barcodeResult: {
              barcodes: [
                {
                  type: 'QR_CODE',
                  data: 'https://example.com',
                  format: 'QR_CODE'
                }
              ]
            },
            mrzResult: document.fileType.startsWith('image/') ? {
              documentType: 'PASSPORT',
              country: 'FR',
              surname: 'DUPONT',
              givenNames: 'JEAN',
              documentNumber: '123456789',
              nationality: 'FR',
              dateOfBirth: '1980-01-01',
              sex: 'M',
              expiryDate: '2030-01-01',
              personalNumber: '1234567890123456'
            } : null
          })
        }, 3000)
      })

      // Mettre à jour le statut et le résultat
      get().updateProcessingStatus(documentId, 'COMPLETED')
      get().setProcessingResult(documentId, result)
      get().removeFromProcessingQueue(documentId)

      return result
    } catch (error) {
      get().updateProcessingStatus(documentId, 'ERROR')
      throw error
    }
  },

  // Action de recherche de documents
  searchDocuments: (query: string): Document[] => {
    const { documents } = get()
    if (!query.trim()) return documents
    
    const lowerQuery = query.toLowerCase()
    return documents.filter(doc => 
      doc.fileName.toLowerCase().includes(lowerQuery) ||
      doc.fileType.toLowerCase().includes(lowerQuery)
    )
  },

  // Action de filtrage par statut
  getDocumentsByStatus: (status: ProcessingStatus): Document[] => {
    const { documents } = get()
    return documents.filter(doc => doc.status === status)
  },

  // Action de filtrage par type
  getDocumentsByType: (type: string): Document[] => {
    const { documents } = get()
    return documents.filter(doc => doc.fileType === type)
  },

  // Action de filtrage par plage de dates
  getDocumentsByDateRange: (startDate: Date, endDate: Date): Document[] => {
    const { documents } = get()
    return documents.filter(doc => {
      const uploadDate = new Date(doc.uploadedAt)
      return uploadDate >= startDate && uploadDate <= endDate
    })
  }
}))
