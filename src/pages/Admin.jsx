import React, { useState, useEffect } from 'react'
import { adminAPI, orderAPI, productAPI, categoryAPI } from '../api/client'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: '⏳ Pending',
  confirmed: '✓ Confirmed',
  shipped: '📦 Shipped',
  delivered: '🎉 Delivered',
  cancelled: '❌ Cancelled',
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in Admin component:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-indigo-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
              <p className="font-bold">Error rendering admin dashboard</p>
              <p className="text-sm">Check browser console for details</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
  })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Check if user is admin - redirect if not
  const userRole = localStorage.getItem('userRole')
  const isAdmin = userRole === 'admin' || userRole === 'admin-seller'
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-indigo-50 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-red-100 border-2 border-red-400 text-red-800 p-8 rounded-lg text-center">
            <p className="text-2xl font-bold mb-4">🔒 Access Denied</p>
            <p className="mb-6">Only admin users can access this page.</p>
            <a
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    )
  }
  
  // Auto-delivery timers tracking
  const [autoDeliveryTimers, setAutoDeliveryTimers] = useState({})

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  // Auto-delivery timer effect: after order status changes to 'shipped', auto-deliver after 5 minutes
  useEffect(() => {
    const shippedOrders = orders.filter(o => o.status === 'shipped')
    
    shippedOrders.forEach(order => {
      // If timer doesn't exist for this order, set it up
      if (!autoDeliveryTimers[order._id]) {
        const timer = setTimeout(() => {
          handleUpdateOrderStatus(order._id, 'delivered')
          // Remove timer reference
          setAutoDeliveryTimers(prev => {
            const newTimers = { ...prev }
            delete newTimers[order._id]
            return newTimers
          })
        }, 5 * 60 * 1000) // 5 minutes

        setAutoDeliveryTimers(prev => ({
          ...prev,
          [order._id]: timer
        }))
      }
    })

    // Cleanup function to clear timers when component unmounts or orders change
    return () => {
      Object.values(autoDeliveryTimers).forEach(timer => clearTimeout(timer))
    }
  }, [orders])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      console.log('DEBUG: Fetching admin data...')
      
      let ordersData = []
      
      // Try to fetch all orders via admin API first
      try {
        const adminOrders = await adminAPI.getAllOrders()
        console.log('DEBUG: Orders from adminAPI.getAllOrders():', adminOrders)
        // Ensure it's an array
        ordersData = Array.isArray(adminOrders) ? adminOrders : (adminOrders?.orders || adminOrders?.data || [])
      } catch (adminErr) {
        console.warn('DEBUG: adminAPI.getAllOrders() failed with 403 (permission issue), using user orders:', adminErr.message)
        // Fallback: use user's own orders if admin endpoint fails
        try {
          const userOrders = await orderAPI.getMyOrders()
          console.log('DEBUG: Orders from orderAPI.getMyOrders():', userOrders)
          // Ensure it's an array
          ordersData = Array.isArray(userOrders) ? userOrders : (userOrders?.orders || [])
        } catch (userErr) {
          console.error('DEBUG: Both order API calls failed:', userErr)
          ordersData = []
        }
      }

      // Ensure ordersData is always an array
      if (!Array.isArray(ordersData)) {
        console.warn('DEBUG: ordersData is not an array, converting:', ordersData)
        ordersData = []
      }

      let productsData = []
      let categoriesData = []
      
      try {
        const productsRaw = await productAPI.getAll()
        console.log('DEBUG: Products raw:', productsRaw)
        productsData = Array.isArray(productsRaw) ? productsRaw : (productsRaw?.products || productsRaw?.data || [])
        if (!Array.isArray(productsData)) {
          productsData = []
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
        productsData = []
      }

      try {
        const categoriesRaw = await categoryAPI.getAll()
        console.log('DEBUG: Categories raw:', categoriesRaw)
        categoriesData = Array.isArray(categoriesRaw) ? categoriesRaw : (categoriesRaw?.categories || categoriesRaw?.data || [])
        if (!Array.isArray(categoriesData)) {
          categoriesData = []
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        categoriesData = []
      }

      console.log('DEBUG: Final Orders data (array):', ordersData, 'Length:', ordersData.length)
      console.log('DEBUG: Final Products data (array):', productsData, 'Length:', productsData.length)
      console.log('DEBUG: Final Categories data (array):', categoriesData, 'Length:', categoriesData.length)

      setOrders(ordersData)
      setProducts(productsData)
      setCategories(categoriesData)

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, o) => sum + (o?.totalPrice || 0), 0)
      setStats({
        totalOrders: ordersData.length,
        totalRevenue,
        totalProducts: productsData.length,
        totalCategories: categoriesData.length,
      })

      setError('')
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`)
      console.error('Dashboard data fetch error:', err)
      console.error('Error response:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.category) {
        setError('All product fields are required')
        return
      }

      await productAPI.create({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
      })

      setNewProduct({ name: '', description: '', price: '', category: '' })
      await fetchAllData()
    } catch (err) {
      setError('Failed to create product')
      console.error(err)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      if (!newCategory.name || !newCategory.slug) {
        setError('All category fields are required')
        return
      }

      await categoryAPI.create({
        name: newCategory.name,
        slug: newCategory.slug,
      })

      setNewCategory({ name: '', slug: '' })
      await fetchAllData()
    } catch (err) {
      setError('Failed to create category')
      console.error(err)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus })
      await fetchAllData()
    } catch (err) {
      setError('Failed to update order status')
      console.error(err)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await orderAPI.cancelOrder(orderId)
      await fetchAllData()
    } catch (err) {
      setError('Failed to cancel order')
      console.error(err)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productAPI.delete(productId)
      await fetchAllData()
    } catch (err) {
      setError('Failed to delete product')
      console.error(err)
    }
  }

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(
    (o) => o && (statusFilter === 'all' || o.status === statusFilter)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
          
          {/* Debug: Show current user info */}
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200 text-sm">
            Current User ID: {localStorage.getItem('userId')} | Role: {localStorage.getItem('userRole')}
          </div>        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          {['dashboard', 'order-moderation', 'orders', 'products', 'categories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'order-moderation' ? '📋 Order Moderation' : tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {/* Total Orders */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-gray-500 text-sm">Total Orders</div>
                <div className="text-3xl font-bold mt-2">{stats.totalOrders}</div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-gray-500 text-sm">Total Revenue</div>
                <div className="text-3xl font-bold mt-2 text-green-600">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-gray-500 text-sm">Total Products</div>
                <div className="text-3xl font-bold mt-2">{stats.totalProducts}</div>
              </div>

              {/* Total Categories */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-gray-500 text-sm">Total Categories</div>
                <div className="text-3xl font-bold mt-2">
                  {stats.totalCategories}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Order ID</th>
                      <th className="text-left py-2">Total</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(orders) ? orders : []).slice(0, 5).map((order) => (
                      <tr key={order?._id || Math.random()} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-mono text-xs">
                          {order?._id?.slice(-8)?.toUpperCase() || 'N/A'}
                        </td>
                        <td className="py-2 font-bold">
                          ${(order?.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusColors[order?.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {statusLabels[order?.status] || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Order Moderation Tab */}
        {activeTab === 'order-moderation' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📋 Order Moderation</h2>
            <p className="text-gray-600 mb-6">Confirm orders, move to shipping, or cancel. Orders automatically deliver 5 minutes after shipping.</p>

            {/* Status Filter */}
            <div className="mb-6 flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {status === 'all' ? 'All' : statusLabels[status]}
                  </button>
                )
              )}
            </div>

            {/* Orders Moderation Cards */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600">
                  No orders found with this status.
                </div>
              ) : (
                (Array.isArray(filteredOrders) ? filteredOrders : []).map((order) => (
                  <div key={order?._id || Math.random()} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          Order #{order?._id?.slice(-8)?.toUpperCase() || 'N/A'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} at {order?.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[order?.status] || 'bg-gray-100'
                        }`}
                      >
                        {statusLabels[order?.status] || 'Unknown'}
                      </span>
                    </div>

                    {/* Shipping Information */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                      <div>
                        <p className="text-gray-600 text-sm">Shipping Address</p>
                        <p className="font-medium">{order?.shippingAddress?.fullName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order?.shippingAddress?.address || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order?.shippingAddress?.city || 'N/A'}, {order?.shippingAddress?.zipCode || 'N/A'}</p>
                        <p className="text-sm text-gray-600">📞 {order?.shippingAddress?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Order Summary</p>
                        <p className="text-2xl font-bold text-green-600">${(order?.totalPrice || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{(Array.isArray(order?.items) ? order.items : []).length} item(s)</p>
                        {order?.notes && (
                          <p className="text-sm mt-2 p-2 bg-yellow-50 rounded">
                            <strong>Notes:</strong> {String(order.notes)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-gray-600 text-sm font-medium mb-2">Items:</p>
                      <ul className="space-y-1 text-sm">
                        {(Array.isArray(order?.items) ? order.items : []).map((item, idx) => {
                          // Handle both full product objects and item references
                          let productId = item?.productId || item?._id || 'N/A';
                          // If productId is an object, try to extract _id from it
                          if (typeof productId === 'object' && productId !== null) {
                            productId = productId?._id || productId?.id || 'N/A';
                          }
                          const quantity = item?.quantity || 1;
                          const price = item?.price || 0;
                          return (
                            <li key={idx} className="text-gray-700">
                              • Product ID: {String(productId)} × {quantity} @ ${Number(price).toFixed(2)} each
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 flex-wrap">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          >
                            ✓ Confirm Order
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          >
                            ✕ Cancel Order
                          </button>
                        </>
                      )}

                      {order.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          >
                            📦 Move to Shipping
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          >
                            ✕ Cancel Order
                          </button>
                        </>
                      )}

                      {order.status === 'shipped' && (
                        <>
                          <div className="bg-blue-50 p-3 rounded flex items-center gap-2 flex-1">
                            <span className="text-blue-600">⏳</span>
                            <span className="text-sm text-blue-800">
                              This order will automatically be delivered in ~5 minutes
                            </span>
                          </div>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          >
                            🎉 Deliver Now
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          >
                            ✕ Cancel Order
                          </button>
                        </>
                      )}

                      {order.status === 'delivered' && (
                        <div className="bg-green-50 p-3 rounded w-full">
                          <span className="text-green-800 text-sm">✓ Order delivered successfully</span>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="bg-red-50 p-3 rounded w-full">
                          <span className="text-red-800 text-sm">✕ Order cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>

            {/* Status Filter */}
            <div className="mb-6 flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {status === 'all' ? 'All' : statusLabels[status]}
                  </button>
                )
              )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(filteredOrders) ? filteredOrders : []).map((order) => (
                      <tr key={order?._id || Math.random()} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">
                          {order?._id?.slice(-8)?.toUpperCase() || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          ${(order?.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order?.status || 'pending'}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order?._id, e.target.value)
                            }
                            className={`px-3 py-1 rounded text-xs font-medium border ${
                              statusColors[order?.status] || 'bg-gray-100'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:underline text-sm">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Add Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Product Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  placeholder="Description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  placeholder="Price"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {(Array.isArray(categories) ? categories : []).map((cat) => (
                    <option key={cat?._id || Math.random()} value={cat?._id || ''}>
                      {cat?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
                >
                  Add Product
                </button>
              </form>
            </div>

            {/* Products List */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">Products List</h3>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(products) ? products : []).map((product) => (
                        <tr key={product?._id || Math.random()} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{product?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-600">{product?.category || 'N/A'}</td>
                          <td className="py-3 px-4 font-bold">
                            ${(product?.price || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDeleteProduct(product?._id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add Category Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Add Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Category Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  placeholder="Slug (e.g. electronics)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
                >
                  Add Category
                </button>
              </form>
            </div>

            {/* Categories List */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">Categories List</h3>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Slug</th>
                        <th className="text-left py-3 px-4">Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(categories) ? categories : []).map((category) => {
                        const productCount = (Array.isArray(products) ? products : []).filter(
                          (p) => p?.category === category?.name
                        ).length
                        return (
                          <tr key={category?._id || Math.random()} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{category?.name || 'N/A'}</td>
                            <td className="py-3 px-4 text-gray-600">{category?.slug || 'N/A'}</td>
                            <td className="py-3 px-4 font-bold">{productCount}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
