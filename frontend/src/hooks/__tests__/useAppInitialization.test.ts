import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAppInitialization } from '../useAppInitialization'
import { useAuthStore, useDocumentStore, useUIStore } from '@/stores'

// Mock des stores
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useDocumentStore: vi.fn(),
  useUIStore: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

describe('useAppInitialization Hook', () => {
  const mockRefreshToken = vi.fn()
  const mockLoadDocuments = vi.fn()
  const mockSetTheme = vi.fn()
  const mockSetLanguage = vi.fn()

  beforeEach(() => {
    // Configuration des mocks des stores
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
      refreshToken: mockRefreshToken
    })

    (useDocumentStore as any).mockReturnValue({
      loadDocuments: mockLoadDocuments
    })

    (useUIStore as any).mockReturnValue({
      setTheme: mockSetTheme,
      setLanguage: mockSetLanguage
    })

    // Nettoyer les mocks
    vi.clearAllMocks()
    localStorageMock.getItem.mockClear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAppInitialization())
    
    expect(result.current.isInitialized).toBe(true)
  })

  it('should load theme from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    renderHook(() => useAppInitialization())
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should load language from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValue('en')
    
    renderHook(() => useAppInitialization())
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('language')
    expect(mockSetLanguage).toHaveBeenCalledWith('en')
  })

  it('should not set theme if none stored in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderHook(() => useAppInitialization())
    
    expect(mockSetTheme).not.toHaveBeenCalled()
  })

  it('should not set language if none stored in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    renderHook(() => useAppInitialization())
    
    expect(mockSetLanguage).not.toHaveBeenCalled()
  })

  it('should refresh token and load documents when user is authenticated', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'USER' as const,
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      refreshToken: mockRefreshToken
    })

    renderHook(() => useAppInitialization())
    
    await waitFor(() => {
      expect(mockRefreshToken).toHaveBeenCalled()
      expect(mockLoadDocuments).toHaveBeenCalled()
    })
  })

  it('should not refresh token or load documents when user is not authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
      refreshToken: mockRefreshToken
    })

    renderHook(() => useAppInitialization())
    
    expect(mockRefreshToken).not.toHaveBeenCalled()
    expect(mockLoadDocuments).not.toHaveBeenCalled()
  })

  it('should handle multiple localStorage calls correctly', () => {
    localStorageMock.getItem
      .mockReturnValueOnce('light') // theme
      .mockReturnValueOnce('fr')    // language
    
    renderHook(() => useAppInitialization())
    
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(2)
    expect(localStorageMock.getItem).toHaveBeenNthCalledWith(1, 'theme')
    expect(localStorageMock.getItem).toHaveBeenNthCalledWith(2, 'language')
    expect(mockSetTheme).toHaveBeenCalledWith('light')
    expect(mockSetLanguage).toHaveBeenCalledWith('fr')
  })

  it('should handle invalid theme value gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-theme')
    
    renderHook(() => useAppInitialization())
    
    // Le hook devrait gérer les valeurs invalides
    expect(mockSetTheme).toHaveBeenCalledWith('invalid-theme')
  })

  it('should handle invalid language value gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-lang')
    
    renderHook(() => useAppInitialization())
    
    // Le hook devrait gérer les valeurs invalides
    expect(mockSetLanguage).toHaveBeenCalledWith('invalid-lang')
  })

  it('should work with empty string values', () => {
    localStorageMock.getItem
      .mockReturnValueOnce('') // theme
      .mockReturnValueOnce('') // language
    
    renderHook(() => useAppInitialization())
    
    expect(mockSetTheme).toHaveBeenCalledWith('')
    expect(mockSetLanguage).toHaveBeenCalledWith('')
  })

  it('should handle async operations correctly', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'USER' as const,
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    // Simuler des opérations asynchrones
    mockRefreshToken.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)))
    mockLoadDocuments.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 10)))

    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      refreshToken: mockRefreshToken
    })

    renderHook(() => useAppInitialization())
    
    await waitFor(() => {
      expect(mockRefreshToken).toHaveBeenCalled()
      expect(mockLoadDocuments).toHaveBeenCalled()
    })
  })

  it('should not cause infinite re-renders', () => {
    const renderCount = vi.fn()
    
    const { rerender } = renderHook(() => {
      renderCount()
      return useAppInitialization()
    })
    
    // Re-render plusieurs fois
    rerender()
    rerender()
    rerender()
    
    // Le hook ne devrait pas causer de boucles infinies
    expect(renderCount).toHaveBeenCalledTimes(4) // Initial + 3 re-renders
  })

  it('should handle missing user gracefully', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: null, // Utilisateur manquant
      refreshToken: mockRefreshToken
    })

    renderHook(() => useAppInitialization())
    
    // Même avec isAuthenticated = true, si user est null, ne pas appeler refreshToken
    expect(mockRefreshToken).not.toHaveBeenCalled()
    expect(mockLoadDocuments).not.toHaveBeenCalled()
  })
})
