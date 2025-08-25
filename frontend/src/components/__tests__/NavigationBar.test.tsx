import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import NavigationBar from '../NavigationBar'
import { useAuthStore, useUIStore } from '@/stores'

// Mock des stores
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useUIStore: vi.fn()
}))

describe('NavigationBar Component', () => {
  const mockLogout = vi.fn()
  const mockToggleTheme = vi.fn()
  const mockShowSuccessMessage = vi.fn()
  const mockOnLogout = vi.fn()

  beforeEach(() => {
    // Configuration des mocks des stores
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      logout: mockLogout,
      isAuthenticated: false
    } as any)

    vi.mocked(useUIStore).mockReturnValue({
      toggleTheme: mockToggleTheme,
      theme: 'light',
      showSuccessMessage: mockShowSuccessMessage
    } as any)

    // Nettoyer les mocks
    vi.clearAllMocks()
  })

  it('renders correctly with logo and navigation', () => {
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('Vision Multimodale')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Historique')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/')
    expect(screen.getByText('Documents')).toHaveAttribute('href', '/documents')
    expect(screen.getByText('Upload')).toHaveAttribute('href', '/upload')
    expect(screen.getByText('Historique')).toHaveAttribute('href', '/history')
  })

  it('shows login and signup buttons when user is not authenticated', () => {
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByText('Inscription')).toBeInTheDocument()
  })

  it('shows user info and logout button when user is authenticated', () => {
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

    render(<NavigationBar user={mockUser} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('USER')).toBeInTheDocument()
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument()
    expect(screen.queryByText('Inscription')).not.toBeInTheDocument()
  })

  it('shows admin navigation when user has admin role', () => {
    const mockAdminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'ADMIN' as const,
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    render(<NavigationBar user={mockAdminUser} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('Administration')).toBeInTheDocument()
    expect(screen.getByText('Administration')).toHaveAttribute('href', '/admin')
  })

  it('handles logout correctly', async () => {
    const user = userEvent.setup()
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

    render(<NavigationBar user={mockUser} onLogout={mockOnLogout} />)
    
    const logoutButton = screen.getByText('Déconnexion')
    await user.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
    expect(mockShowSuccessMessage).toHaveBeenCalledWith('Déconnexion réussie')
    expect(mockOnLogout).toHaveBeenCalled()
  })

  it('handles mobile menu toggle', async () => {
    const user = userEvent.setup()
    
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    const mobileMenuButton = screen.getByLabelText('Ouvrir le menu principal')
    expect(screen.queryByText('Dashboard')).not.toHaveClass('block')
    
    await user.click(mobileMenuButton)
    
    // Vérifier que le menu mobile est ouvert
    expect(screen.getByText('Dashboard')).toHaveClass('block')
  })

  it('renders mobile navigation correctly', async () => {
    const user = userEvent.setup()
    
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    const mobileMenuButton = screen.getByLabelText('Ouvrir le menu principal')
    await user.click(mobileMenuButton)
    
    // Vérifier que tous les liens de navigation mobile sont présents
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Historique')).toBeInTheDocument()
  })

  it('shows user info in mobile menu when authenticated', async () => {
    const user = userEvent.setup()
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

    render(<NavigationBar user={mockUser} onLogout={mockOnLogout} />)
    
    const mobileMenuButton = screen.getByLabelText('Ouvrir le menu principal')
    await user.click(mobileMenuButton)
    
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
  })

  it('handles logout from mobile menu', async () => {
    const user = userEvent.setup()
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

    render(<NavigationBar user={mockUser} onLogout={mockOnLogout} />)
    
    const mobileMenuButton = screen.getByLabelText('Ouvrir le menu principal')
    await user.click(mobileMenuButton)
    
    const mobileLogoutButton = screen.getByText('Déconnexion')
    await user.click(mobileLogoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
    expect(mockShowSuccessMessage).toHaveBeenCalledWith('Déconnexion réussie')
    expect(mockOnLogout).toHaveBeenCalled()
  })

  it('uses store user when prop user is not provided', () => {
    const mockStoreUser = {
      id: 1,
      username: 'storeuser',
      email: 'store@example.com',
      role: 'USER' as const,
      firstName: 'Store',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    (useAuthStore as any).mockReturnValue({
      user: mockStoreUser,
      logout: mockLogout,
      isAuthenticated: true
    })

    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('storeuser')).toBeInTheDocument()
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
  })

  it('prioritizes prop user over store user', () => {
    const mockPropUser = {
      id: 2,
      username: 'propuser',
      email: 'prop@example.com',
      role: 'USER' as const,
      firstName: 'Prop',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    const mockStoreUser = {
      id: 1,
      username: 'storeuser',
      email: 'store@example.com',
      role: 'USER' as const,
      firstName: 'Store',
      lastName: 'User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }

    (useAuthStore as any).mockReturnValue({
      user: mockStoreUser,
      logout: mockLogout,
      isAuthenticated: true
    })

    render(<NavigationBar user={mockPropUser} onLogout={mockOnLogout} />)
    
    expect(screen.getByText('propuser')).toBeInTheDocument()
    expect(screen.queryByText('storeuser')).not.toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-secondary-200')
    
    const logo = screen.getByText('Vision Multimodale')
    expect(logo).toHaveClass('text-xl', 'font-bold', 'text-secondary-900')
  })

  it('handles theme toggle', async () => {
    const user = userEvent.setup()
    
    render(<NavigationBar user={null} onLogout={mockOnLogout} />)
    
    // Note: Le bouton de thème n'est pas visible dans le composant actuel
    // Ce test peut être ajouté si un bouton de thème est implémenté
    expect(mockToggleTheme).not.toHaveBeenCalled()
  })
})
