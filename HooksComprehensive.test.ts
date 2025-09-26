import React from 'react'
import { renderHook, act } from '@testing-library/react'

// Mock custom hooks for comprehensive testing
const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = React.useState(initialValue)
  
  const increment = () => setCount(prev => prev + 1)
  const decrement = () => setCount(prev => prev - 1)
  const reset = () => setCount(initialValue)
  const setValue = (value: number) => setCount(value)
  
  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  }
}

const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: any) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const useToggle = (initialValue: boolean = false) => {
  const [value, setValue] = React.useState(initialValue)
  
  const toggle = () => setValue(prev => !prev)
  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)
  
  return {
    value,
    toggle,
    setTrue,
    setFalse
  }
}

const useAsync = (asyncFunction: () => Promise<any>, immediate: boolean = true) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const execute = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFunction()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  React.useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, loading, error, execute }
}

const usePrevious = (value: any) => {
  const ref = React.useRef()
  
  React.useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

describe('Custom Hooks Comprehensive Tests', () => {
  describe('useCounter', () => {
    test('initializes with default value', () => {
      const { result } = renderHook(() => useCounter())
      
      expect(result.current.count).toBe(0)
    })

    test('initializes with custom value', () => {
      const { result } = renderHook(() => useCounter(5))
      
      expect(result.current.count).toBe(5)
    })

    test('increments counter', () => {
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.increment()
      })
      
      expect(result.current.count).toBe(1)
    })

    test('decrements counter', () => {
      const { result } = renderHook(() => useCounter(5))
      
      act(() => {
        result.current.decrement()
      })
      
      expect(result.current.count).toBe(4)
    })

    test('resets counter', () => {
      const { result } = renderHook(() => useCounter(10))
      
      act(() => {
        result.current.increment()
        result.current.increment()
      })
      
      expect(result.current.count).toBe(12)
      
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.count).toBe(10)
    })

    test('sets specific value', () => {
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.setValue(42)
      })
      
      expect(result.current.count).toBe(42)
    })

    test('handles multiple operations', () => {
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.increment()
        result.current.increment()
        result.current.decrement()
        result.current.setValue(10)
        result.current.increment()
      })
      
      expect(result.current.count).toBe(11)
    })
  })

  describe('useLocalStorage', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear()
    })

    test('returns initial value when no stored value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      expect(result.current[0]).toBe('initial')
    })

    test('returns stored value when available', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'))
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      expect(result.current[0]).toBe('stored-value')
    })

    test('updates stored value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))
      
      act(() => {
        result.current[1]('new-value')
      })
      
      expect(result.current[0]).toBe('new-value')
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'))
    })

    test('handles complex objects', () => {
      const initialValue = { name: 'John', age: 30 }
      const { result } = renderHook(() => useLocalStorage('user', initialValue))
      
      act(() => {
        result.current[1]({ name: 'Jane', age: 25 })
      })
      
      expect(result.current[0]).toEqual({ name: 'Jane', age: 25 })
    })

    test('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage error')
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))
      
      expect(result.current[0]).toBe('fallback')
      
      // Restore original function
      localStorage.getItem = originalGetItem
    })
  })

  describe('useDebounce', () => {
    test('debounces value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )
      
      expect(result.current).toBe('initial')
      
      rerender({ value: 'updated', delay: 100 })
      expect(result.current).toBe('initial') // Still initial due to debounce
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(result.current).toBe('updated')
    })

    test('handles multiple rapid changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      )
      
      rerender({ value: 'change1', delay: 100 })
      rerender({ value: 'change2', delay: 100 })
      rerender({ value: 'change3', delay: 100 })
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(result.current).toBe('change3')
    })

    test('handles different delay values', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 50 } }
      )
      
      rerender({ value: 'updated', delay: 50 })
      
      await new Promise(resolve => setTimeout(resolve, 75))
      expect(result.current).toBe('updated')
    })
  })

  describe('useToggle', () => {
    test('initializes with default false value', () => {
      const { result } = renderHook(() => useToggle())
      
      expect(result.current.value).toBe(false)
    })

    test('initializes with custom value', () => {
      const { result } = renderHook(() => useToggle(true))
      
      expect(result.current.value).toBe(true)
    })

    test('toggles value', () => {
      const { result } = renderHook(() => useToggle(false))
      
      act(() => {
        result.current.toggle()
      })
      
      expect(result.current.value).toBe(true)
      
      act(() => {
        result.current.toggle()
      })
      
      expect(result.current.value).toBe(false)
    })

    test('sets value to true', () => {
      const { result } = renderHook(() => useToggle(false))
      
      act(() => {
        result.current.setTrue()
      })
      
      expect(result.current.value).toBe(true)
    })

    test('sets value to false', () => {
      const { result } = renderHook(() => useToggle(true))
      
      act(() => {
        result.current.setFalse()
      })
      
      expect(result.current.value).toBe(false)
    })
  })

  describe('useAsync', () => {
    test('handles successful async operation', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('success')
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction))
      
      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe('success')
      expect(result.current.error).toBe(null)
    })

    test('handles failed async operation', async () => {
      const mockAsyncFunction = jest.fn().mockRejectedValue(new Error('Async error'))
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction))
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toEqual(new Error('Async error'))
    })

    test('can execute manually when immediate is false', async () => {
      const mockAsyncFunction = jest.fn().mockResolvedValue('manual-success')
      
      const { result } = renderHook(() => useAsync(mockAsyncFunction, false))
      
      expect(result.current.loading).toBe(false)
      expect(mockAsyncFunction).not.toHaveBeenCalled()
      
      act(() => {
        result.current.execute()
      })
      
      expect(result.current.loading).toBe(true)
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe('manual-success')
    })
  })

  describe('usePrevious', () => {
    test('returns previous value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'initial' } }
      )
      
      expect(result.current).toBeUndefined()
      
      rerender({ value: 'updated' })
      expect(result.current).toBe('initial')
      
      rerender({ value: 'final' })
      expect(result.current).toBe('updated')
    })

    test('handles undefined initial value', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: undefined } }
      )
      
      expect(result.current).toBeUndefined()
      
      rerender({ value: 'defined' })
      expect(result.current).toBeUndefined()
    })
  })

  describe('useWindowSize', () => {
    test('returns initial window size', () => {
      const { result } = renderHook(() => useWindowSize())
      
      expect(result.current.width).toBeGreaterThan(0)
      expect(result.current.height).toBeGreaterThan(0)
    })

    test('updates on window resize', () => {
      const { result } = renderHook(() => useWindowSize())
      
      const initialWidth = result.current.width
      const initialHeight = result.current.height
      
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      act(() => {
        window.dispatchEvent(new Event('resize'))
      })
      
      expect(result.current.width).toBe(1024)
      expect(result.current.height).toBe(768)
    })
  })

  describe('Hook Integration', () => {
    test('multiple hooks work together', () => {
      const { result: counterResult } = renderHook(() => useCounter(5))
      const { result: toggleResult } = renderHook(() => useToggle(false))
      
      act(() => {
        counterResult.current.increment()
        toggleResult.current.toggle()
      })
      
      expect(counterResult.current.count).toBe(6)
      expect(toggleResult.current.value).toBe(true)
    })

    test('hooks maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useCounter(10))
      
      act(() => {
        result.current.increment()
      })
      
      expect(result.current.count).toBe(11)
      
      rerender()
      
      expect(result.current.count).toBe(11)
    })
  })
})