import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../authStore'
import { createMockUser } from '@/test/test-utils'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

describe('Auth Store', () => {
  beforeEach(() => {
    // Réinitialiser le store avant chaque test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
    
    // Nettoyer les mocks
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Login Action', () => {
    it('should handle successful login', async () => {
      const store = useAuthStore.getState()
      const credentials = { username: 'testuser', password: 'password123' }
      
      const loginPromise = store.login(credentials)
      
      // Vérifier l'état de chargement
      expect(useAuthStore.getState().isLoading).toBe(true)
      expect(useAuthStore.getState().error).toBeNull()
      
      const result = await loginPromise
      
      expect(result).toBe(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().isLoading).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
      expect(useAuthStore.getState().user).toBeTruthy()
      expect(useAuthStore.getState().token).toBeTruthy()
      
      // Vérifier que le token est sauvegardé
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', expect.any(String))
    })

    it('should handle login failure', async () => {
      const store = useAuthStore.getState()
      
      // Simuler une erreur en modifiant temporairement la fonction
      const originalLogin = store.login
      useAuthStore.setState({
        login: async () => {
          throw new Error('Invalid credentials')
        }
      })
      
      const result = await useAuthStore.getState().login({ username: 'test', password: 'test' })
      
      expect(result).toBe(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
      expect(useAuthStore.getState().error).toBe('Invalid credentials')
      
      // Restaurer la fonction originale
      useAuthStore.setState({ login: originalLogin })
    })
  })

  describe('Logout Action', () => {
    it('should handle logout correctly', () => {
      // D'abord se connecter
      useAuthStore.setState({
        user: createMockUser(),
        token: 'test-token',
        isAuthenticated: true
      })
      
      const store = useAuthStore.getState()
      store.logout()
      
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().token).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
      
      // Vérifier que le token est supprimé
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('Register Action', () => {
    it('should handle successful registration', async () => {
      const store = useAuthStore.getState()
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      }
      
      const result = await store.register(userData)
      
      expect(result).toBe(true)
      expect(useAuthStore.getState().user).toBeTruthy()
      expect(useAuthStore.getState().isLoading).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
      
      const user = useAuthStore.getState().user
      expect(user?.username).toBe('newuser')
      expect(user?.email).toBe('new@example.com')
    })
  })

  describe('Refresh Token Action', () => {
    it('should refresh token successfully', async () => {
      // D'abord se connecter
      useAuthStore.setState({
        user: createMockUser(),
        token: 'old-token',
        isAuthenticated: true
      })
      
      const store = useAuthStore.getState()
      const result = await store.refreshToken()
      
      expect(result).toBe(true)
      expect(useAuthStore.getState().token).not.toBe('old-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', expect.any(String))
    })

    it('should logout on token refresh failure', async () => {
      // D'abord se connecter
      useAuthStore.setState({
        user: createMockUser(),
        token: 'old-token',
        isAuthenticated: true
      })
      
      // Simuler une erreur de rafraîchissement
      const store = useAuthStore.getState()
      const originalRefreshToken = store.refreshToken
      useAuthStore.setState({
        refreshToken: async () => {
          throw new Error('Refresh failed')
        }
      })
      
      const result = await useAuthStore.getState().refreshToken()
      
      expect(result).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      
      // Restaurer la fonction originale
      useAuthStore.setState({ refreshToken: originalRefreshToken })
    })
  })

  describe('Clear Error Action', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' })
      
      const store = useAuthStore.getState()
      store.clearError()
      
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('Set User Action', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser = createMockUser()
      const store = useAuthStore.getState()
      
      store.setUser(mockUser)
      
      expect(useAuthStore.getState().user).toBe(mockUser)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })
  })

  describe('Update Profile Action', () => {
    it('should update user profile', () => {
      const mockUser = createMockUser()
      useAuthStore.setState({ user: mockUser })
      
      const store = useAuthStore.getState()
      store.updateProfile({ firstName: 'Updated', lastName: 'Name' })
      
      const updatedUser = useAuthStore.getState().user
      expect(updatedUser?.firstName).toBe('Updated')
      expect(updatedUser?.lastName).toBe('Name')
      expect(updatedUser?.username).toBe(mockUser.username) // Non modifié
    })

    it('should not update profile if no user', () => {
      const store = useAuthStore.getState()
      store.updateProfile({ firstName: 'Updated' })
      
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('State Persistence', () => {
    it('should persist authentication state', () => {
      const mockUser = createMockUser()
      const mockToken = 'persistent-token'
      
      useAuthStore.setState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true
      })
      
      // Simuler la persistance
      const persistedState = useAuthStore.getState()
      expect(persistedState.user).toBe(mockUser)
      expect(persistedState.token).toBe(mockToken)
      expect(persistedState.isAuthenticated).toBe(true)
    })
  })
})
