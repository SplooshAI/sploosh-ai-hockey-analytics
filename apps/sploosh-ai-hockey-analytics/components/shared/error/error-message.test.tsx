import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorMessage } from './error-message'

describe('ErrorMessage', () => {
  it('should render error message with default title', () => {
    render(<ErrorMessage message="Something went wrong" />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Test message" />)
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should render error variant with destructive styling', () => {
    const { container } = render(
      <ErrorMessage message="Error message" variant="error" />
    )
    
    const errorDiv = container.querySelector('.text-destructive')
    expect(errorDiv).toBeInTheDocument()
  })

  it('should render warning variant with yellow styling', () => {
    const { container } = render(
      <ErrorMessage message="Warning message" variant="warning" />
    )
    
    const warningDiv = container.querySelector('.text-yellow-600')
    expect(warningDiv).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Error" onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />)
    
    const retryButton = screen.queryByRole('button', { name: /retry/i })
    expect(retryButton).not.toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Error" onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)
    
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should render custom retry label', () => {
    const onRetry = vi.fn()
    render(
      <ErrorMessage 
        message="Error" 
        onRetry={onRetry} 
        retryLabel="Try Again" 
      />
    )
    
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should render AlertCircle icon', () => {
    const { container } = render(<ErrorMessage message="Error" />)
    
    // Check for svg element (icon)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render RefreshCw icon when retry button is present', () => {
    const onRetry = vi.fn()
    const { container } = render(<ErrorMessage message="Error" onRetry={onRetry} />)
    
    // Should have 2 SVGs: AlertCircle + RefreshCw
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBe(2)
  })
})
