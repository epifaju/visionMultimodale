import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import Card from '../Card'

describe('Card Component - Simple Tests', () => {
  it('renders correctly with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with default padding', () => {
    render(<Card>Content</Card>)
    
    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('p-6')
  })

  it('renders with different padding variants', () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>)
    let card = screen.getByText('Small padding').closest('div')
    expect(card).toHaveClass('p-3')

    rerender(<Card padding="md">Medium padding</Card>)
    card = screen.getByText('Medium padding').closest('div')
    expect(card).toHaveClass('p-6')

    rerender(<Card padding="lg">Large padding</Card>)
    card = screen.getByText('Large padding').closest('div')
    expect(card).toHaveClass('p-8')

    rerender(<Card padding="none">No padding</Card>)
    card = screen.getByText('No padding').closest('div')
    expect(card).not.toHaveClass('p-3', 'p-6', 'p-8')
  })

  it('renders with different shadow variants', () => {
    const { rerender } = render(<Card shadow="sm">Small shadow</Card>)
    let card = screen.getByText('Small shadow').closest('div')
    expect(card).toHaveClass('shadow-sm')

    rerender(<Card shadow="md">Medium shadow</Card>)
    card = screen.getByText('Medium shadow').closest('div')
    expect(card).toHaveClass('shadow-md')

    rerender(<Card shadow="lg">Large shadow</Card>)
    card = screen.getByText('Large shadow').closest('div')
    expect(card).toHaveClass('shadow-lg')

    rerender(<Card shadow="none">No shadow</Card>)
    card = screen.getByText('No shadow').closest('div')
    expect(card).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg')
  })

  it('applies custom className', () => {
    render(<Card className="custom-card">Custom</Card>)
    
    const card = screen.getByText('Custom').closest('div')
    expect(card).toHaveClass('custom-card')
  })

  it('combines multiple props correctly', () => {
    render(
      <Card padding="lg" shadow="lg" className="custom-class">
        Complex Card
      </Card>
    )
    
    const card = screen.getByText('Complex Card').closest('div')
    expect(card).toHaveClass('p-8', 'shadow-lg', 'custom-class')
  })

  it('renders with default styling', () => {
    render(<Card>Default</Card>)
    
    const card = screen.getByText('Default').closest('div')
    expect(card).toHaveClass(
      'bg-white',
      'rounded-lg',
      'border',
      'border-secondary-200'
    )
  })
})
