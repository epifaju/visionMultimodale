import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Card from '../Card'

describe('Card Component', () => {
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
    
    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('p-6')
  })

  it('renders with different padding variants', () => {
    const { rerender } = render(<Card padding="sm">Small padding</Card>)
    let card = screen.getByText('Small padding').parentElement
    expect(card).toHaveClass('p-4')

    rerender(<Card padding="md">Medium padding</Card>)
    card = screen.getByText('Medium padding').parentElement
    expect(card).toHaveClass('p-6')

    rerender(<Card padding="lg">Large padding</Card>)
    card = screen.getByText('Large padding').parentElement
    expect(card).toHaveClass('p-8')
  })

  it('renders with different shadow variants', () => {
    const { rerender } = render(<Card shadow="sm">Small shadow</Card>)
    let card = screen.getByText('Small shadow').parentElement
    expect(card).toHaveClass('shadow-sm')

    rerender(<Card shadow="md">Medium shadow</Card>)
    card = screen.getByText('Medium shadow').parentElement
    expect(card).toHaveClass('shadow-md')

    rerender(<Card shadow="lg">Large shadow</Card>)
    card = screen.getByText('Large shadow').parentElement
    expect(card).toHaveClass('shadow-lg')

    rerender(<Card shadow="xl">Extra large shadow</Card>)
    card = screen.getByText('Extra large shadow').parentElement
    expect(card).toHaveClass('shadow-xl')
  })

  it('applies custom className', () => {
    render(<Card className="custom-card">Custom</Card>)
    
    const card = screen.getByText('Custom').parentElement
    expect(card).toHaveClass('custom-card')
  })

  it('combines multiple props correctly', () => {
    render(
      <Card 
        padding="lg" 
        shadow="xl" 
        className="custom-class"
      >
        Complex Card
      </Card>
    )
    
    const card = screen.getByText('Complex Card').parentElement
    expect(card).toHaveClass('p-8', 'shadow-xl', 'custom-class')
  })

  it('renders with default styling', () => {
    render(<Card>Default</Card>)
    
    const card = screen.getByText('Default').parentElement
    expect(card).toHaveClass(
      'bg-white',
      'rounded-lg',
      'border',
      'border-secondary-200',
      'p-6',
      'shadow-md'
    )
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Card ref={ref}>Ref Card</Card>)
    
    expect(ref).toHaveBeenCalled()
  })
})
