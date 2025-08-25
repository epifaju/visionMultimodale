// Configuration des stores Zustand
export const storeConfig = {
  // Options de développement
  devtools: process.env.NODE_ENV === 'development',
  
  // Options de persistance
  persist: {
    // Nom du stockage localStorage
    name: 'vision-multimodale-stores',
    
    // Options de sérialisation
    serialize: (data: any) => JSON.stringify(data),
    deserialize: (data: string) => JSON.parse(data),
    
    // Gestion des erreurs de stockage
    onRehydrateStorage: () => (state: any) => {
      console.log('Stores rehydratés:', state)
    },
    
    onError: (error: Error) => {
      console.error('Erreur de persistance des stores:', error)
    }
  },
  
  // Options de middleware
  middleware: {
    // Log des actions en développement
    logActions: process.env.NODE_ENV === 'development',
    
    // Log des changements d'état en développement
    logStateChanges: process.env.NODE_ENV === 'development'
  }
}

// Configuration des stores individuels
export const authStoreConfig = {
  name: 'auth-store',
  partialize: (state: any) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated
  })
}

export const documentStoreConfig = {
  name: 'document-store',
  partialize: (state: any) => ({
    documents: state.documents,
    currentDocument: state.currentDocument,
    filters: state.filters
  })
}

export const uiStoreConfig = {
  name: 'ui-store',
  partialize: (state: any) => ({
    theme: state.theme,
    language: state.language,
    sidebarOpen: state.sidebarOpen
  })
}
