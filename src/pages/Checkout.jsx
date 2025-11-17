import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderAPI, productAPI } from '../api/client'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
  })

  // Calculate total with defensive checks
  const totalPrice = cart.reduce((sum, item) => {
    const product = item.product || item.productId || {}
    const price = product.price || 0
    const qty = item.quantity || 0
    return sum + (price * qty)
  }, 0)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/cart')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (
        !formData.fullName.trim() ||
        !formData.phone.trim() ||
        !formData.address.trim() ||
        !formData.city.trim() ||
        !formData.zipCode.trim()
      ) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
        setError('Please enter a valid phone number')
        setLoading(false)
        return
      }

      // Enrich guest cart items with product details (name, price) if they're missing
      let enrichedCart = cart
      if (!user) {
        // For guest users, fetch product details for items that only have productId/quantity
        const itemsNeedingDetails = cart.filter(item => !item.product || !item.product.price)
        if (itemsNeedingDetails.length > 0) {
          try {
            const enriched = await Promise.all(
              cart.map(async (item) => {
                if (item.product && item.product.price) {
                  return item // Already has product details
                }
                // Fetch product details from API
                const product = await productAPI.getById(item.productId)
                return {
                  ...item,
                  product: { id: product._id, name: product.name, price: product.price },
                }
              })
            )
            enrichedCart = enriched
          } catch (err) {
            console.error('DEBUG: Failed to fetch product details:', err)
            // Continue with incomplete data rather than fail
          }
        }
      }

      // Prepare order data
      const orderData = {
        items: enrichedCart.map((item) => {
          const product = item.product || item.productId || {}
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price || 0,
          }
        }),
        totalPrice,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        notes: formData.notes,
      }

      console.log('DEBUG: Submitting checkout order:', orderData)

      // Create order - send the whole order object to the API
      const result = await orderAPI.checkout(orderData)

      console.log('DEBUG: Checkout result:', result)

      // Clear cart
      await clearCart()

      // Redirect to success page with order ID
      navigate(`/orders/${result._id}`, {
        state: { message: 'Order placed successfully!' },
      })
    } catch (err) {
      console.error('DEBUG: Checkout error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+998 91 234 56 78"
                    disabled={loading}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                    disabled={loading}
                  />
                </div>

                {/* City & Zip */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tashkent"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100000"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests..."
                    rows="4"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
                >
                  {loading ? 'Processing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b max-h-48 overflow-y-auto">
                {cart.map((item) => {
                  const product = item.product || item.productId || {}
                  return (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="flex-1 line-clamp-1">
                        {product.name || 'Product'} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${((product.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/cart')}
                className="w-full text-blue-600 hover:underline mb-2"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
