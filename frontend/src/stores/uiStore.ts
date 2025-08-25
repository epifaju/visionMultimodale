import { create } from 'zustand'
import type { Notification } from '@/types'

export interface UIState {
  // État
  notifications: Notification[]
  sidebarOpen: boolean
  currentView: string
  theme: 'light' | 'dark'
  language: 'fr' | 'en'
  isLoading: boolean
  error: string | null
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markNotificationAsRead: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: string) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'fr' | 'en') => void
  setLoading: (loading: boolean) => void
  showSuccessMessage: (message: string, duration?: number) => void
  showErrorMessage: (message: string, duration?: number) => void
  showInfoMessage: (message: string, duration?: number) => void
  showWarningMessage: (message: string, duration?: number) => void
  clearError: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // État initial
  notifications: [],
  sidebarOpen: false,
  currentView: 'dashboard',
  theme: 'light',
  language: 'fr',
  isLoading: false,
  error: null,

  // Action d'ajout de notification
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }))

    // Auto-suppression après la durée spécifiée
    const duration = notification.duration || 5000
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id)
      }, duration)
    }
  },

  // Action de suppression de notification
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(notif => notif.id !== id)
    }))
  },

  // Action de nettoyage des notifications
  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Action de marquage de notification comme lue
  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    }))
  },

  // Action de basculement de la sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  // Action de définition de l'état de la sidebar
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },

  // Action de définition de la vue courante
  setCurrentView: (view: string) => {
    set({ currentView: view })
  },

  // Action de basculement du thème
  toggleTheme: () => {
    set((state) => ({ 
      theme: state.theme === 'light' ? 'dark' : 'light' 
    }))
  },

  // Action de définition du thème
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme })
    
    // Appliquer le thème au document
    document.documentElement.classList.toggle('dark', theme === 'dark')
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme)
  },

  // Action de définition de la langue
  setLanguage: (language: 'fr' | 'en') => {
    set({ language })
    
    // Sauvegarder dans localStorage
    localStorage.setItem('language', language)
  },

  // Action de définition de l'état de chargement
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  // Action d'affichage de message de succès
  showSuccessMessage: (message: string, duration = 5000) => {
    get().addNotification({
      type: 'success',
      title: 'Succès',
      message,
      duration
    })
  },

  // Action d'affichage de message d'erreur
  showErrorMessage: (message: string, duration = 8000) => {
    get().addNotification({
      type: 'error',
      title: 'Erreur',
      message,
      duration
    })
  },

  // Action d'affichage de message d'information
  showInfoMessage: (message: string, duration = 5000) => {
    get().addNotification({
      type: 'info',
      title: 'Information',
      message,
      duration
    })
  },

  // Action d'affichage de message d'avertissement
  showWarningMessage: (message: string, duration = 6000) => {
    get().addNotification({
      type: 'warning',
      title: 'Avertissement',
      message,
      duration
    })
  },

  // Action de nettoyage des erreurs
  clearError: () => set({ error: null })
}))
