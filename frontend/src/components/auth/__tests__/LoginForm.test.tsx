import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'
import { useAuthStore, useUIStore } from '@/stores'

// Mock des stores
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useUIStore: vi.fn()
}))

describe('LoginForm Component', () => {
  const mockLogin = vi.fn()
  const mockShowSuccessMessage = vi.fn()
  const mockShowErrorMessage = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    // Configuration des mocks des stores
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError
    })

    (useUIStore as any).mockReturnValue({
      showSuccessMessage: mockShowSuccessMessage,
      showErrorMessage: mockShowErrorMessage
    })

    // Nettoyer les mocks
    vi.clearAllMocks()
  })

  it('renders correctly with all form elements', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText("Nom d'utilisateur")).toBeInTheDocument()
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
    expect(screen.getByText('Connexion à votre compte')).toBeInTheDocument()
  })

  it('handles form submission with valid credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    })
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    await user.click(submitButton)
    
    expect(screen.getByText("Le nom d'utilisateur est requis")).toBeInTheDocument()
    expect(screen.getByText('Le mot de passe est requis')).toBeInTheDocument()
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, '123')
    await user.click(submitButton)
    
    expect(screen.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeInTheDocument()
  })

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup()
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    // Soumettre pour déclencher l'erreur
    await user.click(submitButton)
    expect(screen.getByText("Le nom d'utilisateur est requis")).toBeInTheDocument()
    
    // Commencer à taper pour effacer l'erreur
    await user.type(usernameInput, 'test')
    expect(screen.queryByText("Le nom d'utilisateur est requis")).not.toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))
    
    // Simuler l'état de chargement
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError
    })
    
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Connexion en cours...')).toBeInTheDocument()
  })

  it('shows success message on successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockShowSuccessMessage).toHaveBeenCalledWith('Connexion réussie !')
    })
  })

  it('shows error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(false)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockShowErrorMessage).toHaveBeenCalledWith('Échec de la connexion')
    })
  })

  it('shows error message on login exception', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValue(new Error('Network error'))
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockShowErrorMessage).toHaveBeenCalledWith('Erreur lors de la connexion')
    })
  })

  it('calls onLogin callback when provided and login succeeds', async () => {
    const user = userEvent.setup()
    const mockOnLogin = vi.fn()
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm onLogin={mockOnLogin} />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      })
    })
  })

  it('displays auth store error when present', () => {
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials from store',
      clearError: mockClearError
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText('Invalid credentials from store')).toBeInTheDocument()
    expect(screen.getByText('Erreur de connexion')).toBeInTheDocument()
  })

  it('clears error before submitting form', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm />)
    
    const usernameInput = screen.getByLabelText("Nom d'utilisateur")
    const passwordInput = screen.getByLabelText('Mot de passe')
    const submitButton = screen.getByRole('button', { name: 'Se connecter' })
    
    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockClearError).toHaveBeenCalled()
  })

  it('handles remember me checkbox', () => {
    render(<LoginForm />)
    
    const rememberMeCheckbox = screen.getByLabelText('Se souvenir de moi')
    expect(rememberMeCheckbox).toBeInTheDocument()
    expect(rememberMeCheckbox).not.toBeChecked()
  })

  it('renders forgot password link', () => {
    render(<LoginForm />)
    
    const forgotPasswordLink = screen.getByText('Mot de passe oublié ?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '#')
  })

  it('renders sign up link', () => {
    render(<LoginForm />)
    
    const signUpLink = screen.getByText('Créer un compte')
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '#')
  })
})
