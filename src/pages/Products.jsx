import { useState, useEffect } from 'react'
import { productAPI } from '../api/client'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

export default function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const { addToCart, loading: cartLoading } = useCart()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await productAPI.getAll()
      if (Array.isArray(data)) {
        setProducts(data)
        setFilteredProducts(data)
        setError('')
      } else {
        setProducts([])
        setFilteredProducts([])
        setError('Unexpected API response: products data is not an array')
        console.error('API returned non-array for products:', data)
      }
    } catch (err) {
      // If our API client threw a helpful error (HTML payload), show it in the UI for debugging
      if (err?.payload) {
        setError(`${err.message} (status: ${err.status || 'unknown'})`)
        console.error('API HTML payload:', err.payload)
      } else {
        setError('Failed to load products')
        console.error(err)
      }
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await productAPI.getAll() // Using same endpoint for demo
      if (Array.isArray(data)) {
        const uniqueCategories = [...new Set(data.map(p => p.category))]
        setCategories(uniqueCategories.filter(c => c))
      } else {
        setCategories([])
        console.error('API returned non-array for categories:', data)
      }
    } catch (err) {
      setCategories([])
      console.error('Failed to load categories', err)
    }
  }

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, products])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Products</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-lg text-gray-600">No products found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => addToCart(product._id, 1, product)}
                loading={cartLoading}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      </div>
    </div>
  )
}
