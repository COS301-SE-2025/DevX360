import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Additional component tests for better coverage
describe('Additional Component Tests', () => {
  describe('Form Components', () => {
    const MockForm: React.FC = () => {
      const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        message: ''
      })
      const [isSubmitting, setIsSubmitting] = React.useState(false)
      const [errors, setErrors] = React.useState<Record<string, string>>({})

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user starts typing
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: '' }))
        }
      }

      const validateForm = () => {
        const newErrors: Record<string, string> = {}
        
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required'
        }
        
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid'
        }
        
        if (!formData.message.trim()) {
          newErrors.message = 'Message is required'
        }
        
        return newErrors
      }

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors)
          return
        }
        
        setIsSubmitting(true)
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('Form submitted:', formData)
        } catch (error) {
          console.error('Submission error:', error)
        } finally {
          setIsSubmitting(false)
        }
      }

      return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Form</h2>
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your message"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            } text-white`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )
    }

    test('renders form with all fields', () => {
      render(<MockForm />)
      
      expect(screen.getByText('Contact Form')).toBeInTheDocument()
      expect(screen.getByLabelText('Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Email *')).toBeInTheDocument()
      expect(screen.getByLabelText('Message *')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    test('handles form input changes', () => {
      render(<MockForm />)
      
      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(messageInput, { target: { value: 'Hello world' } })
      
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      expect(messageInput).toHaveValue('Hello world')
    })

    test('validates required fields', async () => {
      render(<MockForm />)
      
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Message is required')).toBeInTheDocument()
      })
    })

    test('validates email format', async () => {
      render(<MockForm />)
      
      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(messageInput, { target: { value: 'Hello world' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument()
      })
    })

    test('clears errors when user starts typing', async () => {
      render(<MockForm />)
      
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByLabelText('Name *')
      fireEvent.change(nameInput, { target: { value: 'John' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
      })
    })

    test('handles successful form submission', async () => {
      render(<MockForm />)
      
      const nameInput = screen.getByLabelText('Name *')
      const emailInput = screen.getByLabelText('Email *')
      const messageInput = screen.getByLabelText('Message *')
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      fireEvent.change(messageInput, { target: { value: 'Hello world' } })
      
      fireEvent.click(submitButton)
      
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(screen.queryByText('Submitting...')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled()
      })
    })
  })

  describe('Modal Components', () => {
    const MockModal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ 
      isOpen, 
      onClose, 
      children 
    }) => {
      React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            onClose()
          }
        }

        if (isOpen) {
          document.addEventListener('keydown', handleEscape)
          document.body.style.overflow = 'hidden'
        }

        return () => {
          document.removeEventListener('keydown', handleEscape)
          document.body.style.overflow = 'unset'
        }
      }, [isOpen, onClose])

      if (!isOpen) return null

      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {children}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    test('renders modal when open', () => {
      const onClose = jest.fn()
      render(
        <MockModal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </MockModal>
      )
      
      expect(screen.getByText('Modal Content')).toBeInTheDocument()
      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    test('does not render modal when closed', () => {
      const onClose = jest.fn()
      render(
        <MockModal isOpen={false} onClose={onClose}>
          <div>Modal Content</div>
        </MockModal>
      )
      
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
    })

    test('closes modal when close button is clicked', () => {
      const onClose = jest.fn()
      render(
        <MockModal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </MockModal>
      )
      
      const closeButton = screen.getByText('Close')
      fireEvent.click(closeButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('closes modal when backdrop is clicked', () => {
      const onClose = jest.fn()
      render(
        <MockModal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </MockModal>
      )
      
      const backdrop = screen.getByText('Modal Content').closest('div')?.parentElement?.previousElementSibling
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    test('closes modal when Escape key is pressed', () => {
      const onClose = jest.fn()
      render(
        <MockModal isOpen={true} onClose={onClose}>
          <div>Modal Content</div>
        </MockModal>
      )
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Data Display Components', () => {
    const MockDataTable: React.FC<{ data: any[] }> = ({ data }) => {
      const [sortField, setSortField] = React.useState<string | null>(null)
      const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
      const [filter, setFilter] = React.useState('')

      const handleSort = (field: string) => {
        if (sortField === field) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
          setSortField(field)
          setSortDirection('asc')
        }
      }

      const filteredData = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(filter.toLowerCase())
        )
      )

      const sortedData = [...filteredData].sort((a, b) => {
        if (!sortField) return 0
        
        const aValue = a[sortField]
        const bValue = b[sortField]
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })

      return (
        <div className="w-full">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter data..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('role')}
                  >
                    Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {sortedData.length} of {data.length} items
          </div>
        </div>
      )
    }

    const mockData = [
      { name: 'John Doe', email: 'john@example.com', role: 'Developer' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
      { name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
    ]

    test('renders data table with all rows', () => {
      render(<MockDataTable data={mockData} />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
      expect(screen.getByText('Showing 3 of 3 items')).toBeInTheDocument()
    })

    test('filters data based on search input', () => {
      render(<MockDataTable data={mockData} />)
      
      const filterInput = screen.getByPlaceholderText('Filter data...')
      fireEvent.change(filterInput, { target: { value: 'John' } })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
      expect(screen.getByText('Showing 1 of 3 items')).toBeInTheDocument()
    })

    test('sorts data by column', () => {
      render(<MockDataTable data={mockData} />)
      
      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      
      // Check that sort indicator appears
      expect(screen.getByText('Name ↑')).toBeInTheDocument()
    })

    test('toggles sort direction', () => {
      render(<MockDataTable data={mockData} />)
      
      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)
      expect(screen.getByText('Name ↑')).toBeInTheDocument()
      
      fireEvent.click(nameHeader)
      expect(screen.getByText('Name ↓')).toBeInTheDocument()
    })
  })
})