import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from '../Input'

describe('Input Component - Simple Tests', () => {
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
  })

  it('renders with required prop', () => {
    render(<Input 
      label="Test" 
      required 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByLabelText('Test')).toHaveAttribute('required')
    expect(screen.getByText('*')).toBeInTheDocument()
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

  it('renders with error prop', () => {
    render(<Input 
      label="Test" 
      error="This field is required" 
      value=""
      onChange={mockOnChange}
    />)
    
    expect(screen.getByText('This field is required')).toBeInTheDocument()
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
})
