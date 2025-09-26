import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('LoadingSpinner Component', () => {
  test('renders loading spinner', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
  })

  test('applies medium size by default', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('h-6', 'w-6')
  })

  test('applies small size when size is sm', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  test('applies medium size when size is md', () => {
    render(<LoadingSpinner size="md" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('h-6', 'w-6')
  })

  test('applies large size when size is lg', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  test('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('custom-class')
  })

  test('has animate-spin class for rotation', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('animate-spin')
  })

  test('has primary color styling', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('text-primary-600')
  })

  test('renders Loader2 icon', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner.tagName).toBe('svg')
  })
})