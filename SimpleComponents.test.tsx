import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import LoadingSpinner from '@/components/LoadingSpinner'

describe('Simple Components Tests', () => {
  describe('Button Component', () => {
    test('renders button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    test('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('applies different variants', () => {
      render(<Button variant="secondary">Secondary Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-secondary')
    })

    test('applies different sizes', () => {
      render(<Button size="lg">Large Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-lg')
    })

    test('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    test('renders with icon', () => {
      render(
        <Button>
          <span data-testid="icon">+</span>
          Add Item
        </Button>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })
  })

  describe('Input Component', () => {
    test('renders input with label', () => {
      render(<Input label="Username" value="" onChange={() => {}} />)
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    test('handles value changes', () => {
      const handleChange = jest.fn()
      render(<Input value="test" onChange={handleChange} />)
      
      const input = screen.getByDisplayValue('test')
      fireEvent.change(input, { target: { value: 'new value' } })
      expect(handleChange).toHaveBeenCalledWith('new value')
    })

    test('shows error message', () => {
      render(<Input error="This field is required" value="" onChange={() => {}} />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    test('shows required asterisk', () => {
      render(<Input label="Email" required value="" onChange={() => {}} />)
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    test('handles different input types', () => {
      render(<Input type="email" value="" onChange={() => {}} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    test('handles disabled state', () => {
      render(<Input disabled value="" onChange={() => {}} />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    test('applies custom className', () => {
      render(<Input className="custom-class" value="" onChange={() => {}} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })
  })

  describe('LoadingSpinner Component', () => {
    test('renders loading spinner', () => {
      render(<LoadingSpinner />)
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    test('applies different sizes', () => {
      render(<LoadingSpinner size="lg" />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('h-8', 'w-8')
    })

    test('applies custom className', () => {
      render(<LoadingSpinner className="custom-spinner" />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('custom-spinner')
    })

    test('has animate-spin class', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('animate-spin')
    })

    test('has primary color styling', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('text-primary-600')
    })
  })

  describe('Component Integration', () => {
    test('components work together in a form', () => {
      const handleSubmit = jest.fn()
      
      render(
        <form onSubmit={handleSubmit}>
          <Input label="Username" value="testuser" onChange={() => {}} />
          <Input label="Password" type="password" value="password123" onChange={() => {}} />
          <Button type="submit">Login</Button>
        </form>
      )

      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })

    test('loading state with spinner', () => {
      render(
        <div>
          <LoadingSpinner />
          <Button disabled>Processing...</Button>
        </div>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    test('button has proper accessibility attributes', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      const button = screen.getByLabelText('Close dialog')
      expect(button).toBeInTheDocument()
    })

    test('input has proper accessibility attributes', () => {
      render(<Input label="Email" value="" onChange={() => {}} />)
      const input = screen.getByLabelText('Email')
      expect(input).toBeInTheDocument()
    })

    test('loading spinner has proper accessibility attributes', () => {
      render(<LoadingSpinner />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('button handles empty children', () => {
      render(<Button></Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    test('input handles empty value', () => {
      render(<Input value="" onChange={() => {}} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    test('loading spinner handles undefined props', () => {
      render(<LoadingSpinner size={undefined} className={undefined} />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
    })
  })
})