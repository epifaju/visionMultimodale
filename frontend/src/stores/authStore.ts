import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, AuthResponse } from '@/types'

export interface AuthState {
  // État
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>
  refreshToken: () => Promise<boolean>
  clearError: () => void
  setUser: (user: User) => void
  updateProfile: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Action de connexion
      login: async (credentials: LoginCredentials): Promise<boolean> => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulation d'appel API - à remplacer par l'appel réel
          const response: AuthResponse = await new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                user: {
                  id: 1,
                  username: credentials.username,
                  email: `${credentials.username}@example.com`,
                  role: 'USER',
                  firstName: 'John',
                  lastName: 'Doe',
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString()
                },
                token: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now()
              })
            }, 1000)
          })

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          // Stocker le token dans localStorage pour la persistance
          localStorage.setItem('auth_token', response.token)
          
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion'
          set({
            isLoading: false,
            error: errorMessage
          })
          return false
        }
      },

      // Action de déconnexion
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        
        // Nettoyer le localStorage
        localStorage.removeItem('auth_token')
      },

      // Action d'inscription
      register: async (userData): Promise<boolean> => {
        set({ isLoading: true, error: null })
        
        try {
          // Simulation d'appel API - à remplacer par l'appel réel
          const newUser: User = await new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                id: Date.now(),
                username: userData.username!,
                email: userData.email!,
                role: 'USER',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
              })
            }, 1000)
          })

          set({
            user: newUser,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur d\'inscription'
          set({
            isLoading: false,
            error: errorMessage
          })
          return false
        }
      },

      // Action de rafraîchissement du token
      refreshToken: async (): Promise<boolean> => {
        const { token } = get()
        if (!token) return false

        try {
          // Simulation de rafraîchissement - à remplacer par l'appel réel
          const newToken = await new Promise<string>((resolve) => {
            setTimeout(() => {
              resolve('new-mock-jwt-token-' + Date.now())
            }, 500)
          })

          set({ token: newToken })
          localStorage.setItem('auth_token', newToken)
          return true
        } catch (error) {
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          get().logout()
          return false
        }
      },

      // Action de nettoyage des erreurs
      clearError: () => set({ error: null }),

      // Action de définition de l'utilisateur
      setUser: (user: User) => set({ user, isAuthenticated: true }),

      // Action de mise à jour du profil
      updateProfile: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
