import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { orderAPI } from '../api/client'

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']

const statusLabels = {
  pending: '⏳ Pending',
  confirmed: '✓ Confirmed',
  shipped: '📦 Shipped',
  delivered: '🎉 Delivered',
  cancelled: '❌ Cancelled',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const data = await orderAPI.getOrderById(id)
      setOrder(data)
      setError('')
    } catch (err) {
      setError('Failed to load order details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      setCancelling(true)
      await orderAPI.cancelOrder(id)
      fetchOrderDetails()
    } catch (err) {
      setError('Failed to cancel order')
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg text-gray-600 mb-4">Order not found</p>
            <Link
              to="/orders"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStatusIndex = statusSteps.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-6">Order Status</h2>

          {order.status === 'cancelled' ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <p className="text-lg font-bold text-red-800">❌ Order Cancelled</p>
              <p className="text-red-700 mt-1">This order has been cancelled</p>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              {statusSteps.map((status, index) => (
                <div key={status} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition ${
                      index <= currentStatusIndex
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    {index < currentStatusIndex ? '✓' : index + 1}
                  </div>

                  {/* Step Label */}
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-500">{statusLabels[status]}</p>
                  </div>

                  {/* Connector Line */}
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition ${
                        index < currentStatusIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Order Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Name:</span>{' '}
                  <span className="font-medium">
                    {order.shippingAddress?.fullName}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{' '}
                  <span className="font-medium">
                    {order.shippingAddress?.phone}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Address:</span>{' '}
                  <span className="font-medium">
                    {order.shippingAddress?.address}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">City:</span>{' '}
                  <span className="font-medium">
                    {order.shippingAddress?.city}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Zip Code:</span>{' '}
                  <span className="font-medium">
                    {order.shippingAddress?.zipCode}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.productId?.name || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Order Notes</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary & Actions */}
          <div className="md:col-span-1">
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4 mb-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-bold mb-6">
                <span>Total</span>
                <span className="text-blue-600">${order.totalPrice.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              <Link
                to="/orders"
                className="block text-center mt-4 text-blue-600 hover:underline"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
