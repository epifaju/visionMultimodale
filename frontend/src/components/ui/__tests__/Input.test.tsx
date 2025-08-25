import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import Input from '../Input'

describe('Input Component', () => {
  const mockOnChange = vi.fn()

  it('renders with basic props', () => {
    render(<Input 
      label="Username" 
      placeholder="Enter username" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument()
  })

  it('renders with different types', () => {
    const { rerender } = render(<Input 
      label="Text" 
      type="text" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Text')).toHaveAttribute('type', 'text')
    
    rerender(<Input 
      label="Password" 
      type="password" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    
    rerender(<Input 
      label="Email" 
      type="email" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
  })

  it('renders with error prop', () => {
    render(<Input 
      label="Test" 
      error="This field is required" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('renders with required prop', () => {
    render(<Input 
      label="Test" 
      required 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toHaveAttribute('required')
  })

  it('renders with custom className', () => {
    render(<Input 
      label="Test" 
      className="custom-input" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toHaveClass('custom-input')
  })

  it('renders with disabled prop', () => {
    render(<Input 
      label="Test" 
      disabled 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toBeDisabled()
  })

  it('renders with ref prop', () => {
    const ref = vi.fn()
    render(<Input 
      label="Test" 
      ref={ref}
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toBeInTheDocument()
  })

  it('renders with focus and blur handlers', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    
    render(<Input 
      label="Test" 
      onFocus={onFocus} 
      onBlur={onBlur}
      value=""
      onChange={mockOnChange}
    />)
    
    const input = screen.getByLabelText('Test')
    input.focus()
    expect(onFocus).toHaveBeenCalled()
    
    input.blur()
    expect(onBlur).toHaveBeenCalled()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Input 
      label="Small" 
      size="sm" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Small')).toHaveClass('px-3 py-1.5 text-sm')
    
    rerender(<Input 
      label="Medium" 
      size="md" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Medium')).toHaveClass('px-4 py-2 text-base')
    
    rerender(<Input 
      label="Large" 
      size="lg" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Large')).toHaveClass('px-6 py-3 text-lg')
  })

  it('renders with success prop', () => {
    render(<Input 
      label="Test" 
      success 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toHaveClass('border-success-500')
  })

  it('renders with warning prop', () => {
    render(<Input 
      label="Test" 
      warning 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toHaveClass('border-warning-500')
  })

  it('renders with all props combined', () => {
    render(
      <Input
        label="Test"
        type="email"
        size="lg"
        required
        error="This field is required"
        className="custom-input"
        disabled
        value=""
        onChange={mockOnChange}
      />
    )
    
    const input = screen.getByLabelText('Test')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('required')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('custom-input', 'px-6 py-3 text-lg')
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })
})
