// Export des stores individuels
export { useAuthStore } from './authStore'
export { useDocumentStore } from './documentStore'
export { useUIStore } from './uiStore'

// Store combiné pour un accès centralisé (optionnel)
import { useAuthStore } from './authStore'
import { useDocumentStore } from './documentStore'
import { useUIStore } from './uiStore'

// Hook personnalisé pour accéder à tous les stores
export const useAppStore = () => {
  const auth = useAuthStore()
  const documents = useDocumentStore()
  const ui = useUIStore()

  return {
    auth,
    documents,
    ui,
    
    // Actions combinées utiles
    resetAllStores: () => {
      auth.logout()
      documents.clearError()
      ui.clearNotifications()
    },
    
    // État global de l'application
    isAppReady: () => {
      return !auth.isLoading && !documents.isLoading && !ui.isLoading
    },
    
    // Gestion des erreurs globales
    hasGlobalError: () => {
      return !!(auth.error || documents.error || ui.error)
    },
    
    clearAllErrors: () => {
      auth.clearError()
      documents.clearError()
      ui.clearError()
    }
  }
}

// Types pour les stores
export type { AuthState } from './authStore'
export type { DocumentState } from './documentStore'
export type { UIState } from './uiStore'
