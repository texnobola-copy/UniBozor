import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()

  // Cart ni load qilish (auth qilinganda)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('DEBUG: User authenticated, fetching cart from server')
      fetchCart()
    } else {
      // load guest cart from localStorage
      console.log('DEBUG: User not authenticated, loading guest cart from localStorage')
      const raw = localStorage.getItem('guest_cart')
      console.log('DEBUG: Raw guest_cart from localStorage:', raw)
      try {
        const parsed = raw ? JSON.parse(raw) : []
        console.log('DEBUG: Parsed guest_cart:', parsed)
        setCart(parsed)
      } catch (err) {
        console.error('DEBUG: Error parsing guest_cart:', err)
        setCart([])
      }
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await cartAPI.getCart()
      // cartAPI already returns response.data, so `response` is the data object
      setCart(response.items || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load cart')
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1, product = null) => {
    setLoading(true)
    try {
      // If user is not authenticated, maintain a guest cart in localStorage
      // Store only productId and quantity to minimize storage; prices/names fetched during checkout
      if (!isAuthenticated) {
        try {
          const raw = localStorage.getItem('guest_cart')
          const parsed = raw ? JSON.parse(raw) : []
          const existing = parsed.find(i => i.productId === productId)
          if (existing) {
            existing.quantity = (existing.quantity || 1) + quantity
          } else {
            // Store only productId and quantity; product details fetched on checkout
            parsed.push({ productId, quantity })
          }
          console.log('DEBUG: Adding to guest cart (IDs only):', parsed)
          localStorage.setItem('guest_cart', JSON.stringify(parsed))
          setCart(parsed)
          console.log('DEBUG: Cart state after setCart:', parsed)
          setLoading(false)
          return { success: true }
        } catch (err) {
          console.error('DEBUG: Guest cart error:', err)
          setLoading(false)
          const errorMsg = 'Failed to update guest cart'
          setError(errorMsg)
          return { success: false, error: errorMsg }
        }
      }
      const response = await cartAPI.addToCart(productId, quantity)
      // cartAPI returns the data object
      setCart(response.items || [])
      setError(null)
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to add to cart'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId) => {
    setLoading(true)
    try {
      if (!isAuthenticated) {
        try {
          const raw = localStorage.getItem('guest_cart')
          const parsed = raw ? JSON.parse(raw) : []
          const next = parsed.filter(i => i.productId !== productId)
          localStorage.setItem('guest_cart', JSON.stringify(next))
          setCart(next)
          setLoading(false)
          return { success: true }
        } catch (err) {
          setLoading(false)
          const errorMsg = 'Failed to update guest cart'
          setError(errorMsg)
          return { success: false, error: errorMsg }
        }
      }

      const response = await cartAPI.removeFromCart(productId)
      setCart(response.items || [])
      setError(null)
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to remove from cart'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      if (!isAuthenticated) {
        localStorage.removeItem('guest_cart')
        setCart([])
        setLoading(false)
        setError(null)
        return { success: true }
      }

      await cartAPI.clearCart()
      setCart([])
      setError(null)
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to clear cart'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    cart,
    loading,
    error,
    cartCount: cart.length,
    addToCart,
    removeFromCart,
    clearCart,
    fetchCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook - CartContext dan foydalanish uchun
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
