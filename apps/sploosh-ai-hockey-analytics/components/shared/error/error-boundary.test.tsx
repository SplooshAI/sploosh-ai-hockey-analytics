import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './error-boundary'
import { vi } from 'vitest'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Suppress console.error for these tests since we're intentionally throwing errors
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument()
  })

  it('should render refresh button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const refreshButton = screen.getByRole('button', { name: /refresh page/i })
    expect(refreshButton).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledTimes(1)
    const errorCall = onError.mock.calls[0]
    expect(errorCall[0]).toBeInstanceOf(Error)
    expect(errorCall[1]).toHaveProperty('componentStack')
  })

  it('should render AlertTriangle icon in error state', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should not show error details in production', () => {
    const originalEnv = process.env.NODE_ENV
    vi.stubEnv('NODE_ENV', 'production')
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.queryByText('Error details')).not.toBeInTheDocument()
    
    vi.unstubAllEnvs()
    if (originalEnv) {
      vi.stubEnv('NODE_ENV', originalEnv)
    }
  })

  it('should show error details in development', () => {
    const originalEnv = process.env.NODE_ENV
    vi.stubEnv('NODE_ENV', 'development')
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error details')).toBeInTheDocument()
    
    vi.unstubAllEnvs()
    if (originalEnv) {
      vi.stubEnv('NODE_ENV', originalEnv)
    }
  })
})
