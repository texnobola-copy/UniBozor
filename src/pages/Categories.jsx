import { useState, useEffect } from 'react'
import { productAPI, categoryAPI } from '../api/client'
import CategoryCard from '../components/CategoryCard'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart } = useCart()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryAPI.getAll()
      setCategories(data)
      setError('')
      if (data.length > 0) {
        setSelectedCategory(data[0])
        fetchProductsByCategory(data[0]._id)
      }
    } catch (err) {
      setError('Failed to load categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const allProducts = await productAPI.getAll()
      const filtered = allProducts.filter(p => p.categoryId === categoryId)
      setProducts(filtered)
    } catch (err) {
      console.error('Failed to load products', err)
      setProducts([])
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    fetchProductsByCategory(category._id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Categories</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading categories...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4">All Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory?._id === category._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm opacity-75">{category.slug}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {selectedCategory && (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {selectedCategory.name}
                  </h2>

                  {products.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg text-center">
                      <p className="text-gray-600">
                        No products in this category yet
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          className="bg-white p-4 rounded-lg shadow-md"
                        >
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="text-lg font-bold">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                {product.description}
                              </p>
                              <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-blue-600">
                                  ${product.price}
                                </span>
                                <button
                                  onClick={() => addToCart(product._id, 1, product)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
