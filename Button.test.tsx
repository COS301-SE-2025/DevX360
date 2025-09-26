import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/Button'

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('applies primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-primary')
  })

  test('applies secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-secondary')
  })

  test('applies danger variant correctly', () => {
    render(<Button variant="danger">Danger Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-danger')
  })

  test('applies ghost variant correctly', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-ghost')
  })

  test('applies small size correctly', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-sm')
  })

  test('applies medium size by default', () => {
    render(<Button>Medium Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-md')
  })

  test('applies large size correctly', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-lg')
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable Button</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('shows loading spinner when loading', () => {
    render(<Button loading>Loading Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    // Check for loading spinner (Loader2 icon)
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument()
  })

  test('is disabled when loading', () => {
    render(<Button loading>Loading Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders as submit button when type is submit', () => {
    render(<Button type="submit">Submit Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  test('renders as reset button when type is reset', () => {
    render(<Button type="reset">Reset Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'reset')
  })

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  test('passes through additional props', () => {
    render(<Button data-testid="custom-button">Button with Props</Button>)
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
  })
})