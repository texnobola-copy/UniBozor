import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { productAPI, categoryAPI } from '../api/client'
import { Button, Badge } from 'flowbite-react'
import { Link } from 'react-router-dom'

export default function Sell() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('products')
  const [editingProductId, setEditingProductId] = useState(null)

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  })

  // Add Category Form
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: ''
  })

  useEffect(() => {
    fetchSellerProducts()
    fetchCategories()
  }, [])

  const fetchSellerProducts = async () => {
    try {
      setLoading(true)
      const data = await productAPI.getAll()
      setProducts(data)
      setError('')
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

    const handleAddProduct = async () => {
    try {
      setLoading(true)
      if (editingProductId) {
        await productAPI.update(editingProductId, newProduct)
        setEditingProductId(null)
      } else {
        await productAPI.create(newProduct)
      }
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '' })
      fetchSellerProducts()
    } catch (err) {
      setError('Failed to save product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      setLoading(true)
      await productAPI.delete(id)
      fetchSellerProducts()
    } catch (err) {
      setError('Failed to delete product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required')
      return
    }
    try {
      setLoading(true)
      const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-')
      await categoryAPI.create({ ...newCategory, slug })
      setNewCategory({ name: '', slug: '' })
      fetchCategories()
      setError('')
    } catch (err) {
      setError('Failed to create category')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      setLoading(true)
      await categoryAPI.delete(id)
      fetchCategories()
    } catch (err) {
      setError('Failed to delete category')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold">💸 Seller Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your products and sales</p>
          </div>
          <Link to="/">
            <Button color="light">Back to Store</Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Products</div>
            <div className="text-3xl font-bold mt-2">{products.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">Active Listings</div>
            <div className="text-3xl font-bold mt-2 text-green-600">{products.filter(p => p.stock > 0).length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-500">Out of Stock</div>
            <div className="text-3xl font-bold mt-2 text-red-600">{products.filter(p => p.stock === 0).length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {['products', 'add', 'categories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'add' ? '➕ Add Product' : tab === 'categories' ? '🏷️ Categories' : '📦 My Products'}
            </button>
          ))}
        </div>

        {/* My Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {products.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Stock</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">${product.price?.toFixed(2) || 0}</td>
                        <td className="py-3 px-4">{product.stock || 0}</td>
                        <td className="py-3 px-4">
                          <Badge color={product.stock > 0 ? 'success' : 'failure'}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="xs">Edit</Button>
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter product description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (so'm) *
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                {categories.length === 0 ? (
                  <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                    ⚠️ No categories yet. Create one in the Categories tab first!
                  </div>
                ) : (
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Select a category --</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" color="success" className="w-full">
                  ✅ Add Product
                </Button>
                <Button
                  type="button"
                  color="light"
                  onClick={() => setNewProduct({ name: '', description: '', price: '', category: '', stock: '' })}
                  className="w-full"
                >
                  Clear
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Category Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">➕ Add Category</h2>

              <form onSubmit={(e) => { e.preventDefault(); handleAddCategory(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Electronics"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  color="success"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : '✅ Create Category'}
                </Button>
              </form>
            </div>

            {/* Categories List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">🏷️ All Categories ({categories.length})</h2>
              </div>

              {categories.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No categories yet. Create your first one!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Slug</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{category.name}</td>
                          <td className="py-3 px-4 text-gray-600">{category.slug}</td>
                          <td className="py-3 px-4">
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => handleDeleteCategory(category._id)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
