import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types'
import { authApi, extractErrorMessage } from '../services/api';

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
  register: (userData: RegisterCredentials) => Promise<boolean>
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
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔐 AuthStore - Attempting login for user:', credentials.username);
          const response = await authApi.login(credentials);
          
          console.log('✅ AuthStore - Login successful, response:', {
            hasUser: !!response.user,
            hasToken: !!response.token,
            userRole: response.user?.role,
            tokenLength: response.token?.length
          });
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          localStorage.setItem('authToken', response.token);
          return true;
        } catch (error: any) {
          console.error('❌ AuthStore - Login failed:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            code: error.code
          });
          
          // Extraire le message d'erreur de manière intelligente
          let errorMessage = 'Erreur de connexion';
          
          if (error.response?.status === 401) {
            errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
            console.warn('⚠️ AuthStore - Invalid credentials (401)');
          } else if (error.response?.status === 400) {
            errorMessage = extractErrorMessage(error);
            console.warn('⚠️ AuthStore - Bad request (400):', error.response?.data);
          } else if (error.response?.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            console.error('🚨 AuthStore - Server error (500):', error.response?.data);
          } else if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
            console.error('🌐 AuthStore - Network error:', error.message);
          } else {
            errorMessage = extractErrorMessage(error);
            console.error('❓ AuthStore - Unknown error:', error);
          }
          
          set({
            isLoading: false,
            error: errorMessage
          });
          
          return false;
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
        localStorage.removeItem('authToken')
        localStorage.removeItem('auth_token') // Nettoyer aussi l'ancienne clé
      },

      // Action d'inscription
      register: async (userData: RegisterCredentials): Promise<boolean> => {
        set({ isLoading: true, error: null })
        
        try {
          console.log('📝 AuthStore - Attempting registration for user:', userData.username);
          const response = await authApi.register(userData);
          
          console.log('✅ AuthStore - Registration successful, response:', {
            hasUser: !!response.user,
            hasToken: !!response.token,
            userRole: response.user?.role,
            tokenLength: response.token?.length
          });
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          
          localStorage.setItem('authToken', response.token);
          return true
        } catch (error: any) {
          console.error('❌ AuthStore - Registration failed:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            code: error.code
          });
          
          // Extraire le message d'erreur de manière intelligente
          let errorMessage = 'Erreur d\'inscription';
          
          if (error.response?.status === 400) {
            errorMessage = extractErrorMessage(error);
            console.warn('⚠️ AuthStore - Bad request (400):', error.response?.data);
          } else if (error.response?.status === 409) {
            errorMessage = 'Un utilisateur avec ce nom ou email existe déjà';
            console.warn('⚠️ AuthStore - Conflict (409): User already exists');
          } else if (error.response?.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            console.error('🚨 AuthStore - Server error (500):', error.response?.data);
          } else if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
            console.error('🌐 AuthStore - Network error:', error.message);
          } else {
            errorMessage = extractErrorMessage(error);
            console.error('❓ AuthStore - Unknown error:', error);
          }
          
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
          localStorage.setItem('authToken', newToken)
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
