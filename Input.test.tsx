import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '@/components/Input'

describe('Input Component', () => {
  test('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  test('renders input with label', () => {
    render(<Input label="Username" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  test('shows required asterisk when required', () => {
    render(<Input label="Required Field" required value="" onChange={() => {}} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  test('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalledWith('new value')
  })

  test('renders as email input when type is email', () => {
    render(<Input type="email" value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  test('renders as password input when type is password', () => {
    render(<Input type="password" value="" onChange={() => {}} />)
    const input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')
  })

  test('renders as number input when type is number', () => {
    render(<Input type="number" value="" onChange={() => {}} />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  test('renders as url input when type is url', () => {
    render(<Input type="url" value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'url')
  })

  test('is disabled when disabled prop is true', () => {
    render(<Input disabled value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  test('is required when required prop is true', () => {
    render(<Input required value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  test('displays error message when error prop is provided', () => {
    render(<Input error="This field is required" value="" onChange={() => {}} />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  test('applies error styling when error is present', () => {
    render(<Input error="Error message" value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  test('applies custom className', () => {
    render(<Input className="custom-class" value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  test('passes through additional props', () => {
    render(<Input data-testid="custom-input" value="" onChange={() => {}} />)
    expect(screen.getByTestId('custom-input')).toBeInTheDocument()
  })

  test('renders with default text type', () => {
    render(<Input value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')
  })

  test('displays current value', () => {
    render(<Input value="current value" onChange={() => {}} />)
    const input = screen.getByDisplayValue('current value')
    expect(input).toBeInTheDocument()
  })
})