import { useEffect } from 'react'
import { useAuthStore, useDocumentStore, useUIStore } from '../stores'

export const useAppInitialization = () => {
  const { isAuthenticated, user, refreshToken } = useAuthStore()
  const { loadDocuments } = useDocumentStore()
  const { setTheme, setLanguage } = useUIStore()

  useEffect(() => {
    // Initialiser le thème depuis localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Initialiser la langue depuis localStorage
    const savedLanguage = localStorage.getItem('language') as 'fr' | 'en' | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    // Vérifier et rafraîchir le token si l'utilisateur est connecté
    if (isAuthenticated && user) {
      refreshToken()
      loadDocuments()
    }
  }, [isAuthenticated, user, refreshToken, loadDocuments, setTheme, setLanguage])

  return {
    isInitialized: true
  }
}
