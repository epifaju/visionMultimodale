import React from 'react'
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { useAuthStore, useDocumentStore, useUIStore } from '@/stores'

// Wrapper personnalisé pour les tests avec les stores Zustand
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Fonction de rendu personnalisée avec les providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Utilitaires pour réinitialiser les stores entre les tests
export const resetStores = () => {
  useAuthStore.getState().logout()
  useDocumentStore.getState().clearError()
  useUIStore.getState().clearNotifications()
}

// Utilitaires pour créer des données de test
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER' as const,
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  ...overrides
})

export const createMockDocument = (overrides = {}) => ({
  id: 1,
  name: 'test-document.pdf',
  type: 'PDF',
  size: 1024 * 1024, // 1MB
  status: 'PENDING' as const,
  uploadedAt: new Date().toISOString(),
  processedAt: null,
  userId: 1,
  ...overrides
})

export const createMockProcessingResult = (overrides = {}) => ({
  documentId: 1,
  processingTime: 1000,
  ocrResult: {
    text: 'Texte extrait par OCR',
    confidence: 0.95,
    language: 'fr'
  },
  pdfResult: null,
  barcodeResult: {
    barcodes: []
  },
  mrzResult: null,
  ...overrides
})

// Hook personnalisé pour tester les stores
export const useTestStore = () => {
  const auth = useAuthStore()
  const documents = useDocumentStore()
  const ui = useUIStore()
  
  return { auth, documents, ui }
}

// Fonction pour attendre que les stores soient mis à jour
export const waitForStoreUpdate = (callback: () => void, timeout = 1000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      try {
        callback()
        resolve()
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Store update timeout'))
        } else {
          setTimeout(check, 10)
        }
      }
    }
    
    check()
  })
}

// Fonction pour simuler des actions utilisateur
export const simulateUserAction = async (action: () => void) => {
  action()
  // Attendre un tick pour que les mises à jour d'état se propagent
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Re-export des fonctions de testing-library
export * from '@testing-library/react'
export { customRender as render }
