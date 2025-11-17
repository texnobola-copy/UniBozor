import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product, onAddToCart, loading }) {
  const { isAuthenticated } = useAuth()
  const { isFavorited, toggleFavorite } = useFavorites()
  const navigate = useNavigate()

  const handleAddClick = () => {
    if (!isAuthenticated) {
      alert('Please login first to add items to cart')
      return
    }
    // parent should provide a no-arg handler that already knows the product
    onAddToCart && onAddToCart()
  }

  // Calculate discount percentage (assuming 40% off)
  const originalPrice = Math.round(product.price * 1.67)
  const discountPercent = 40

  return (
    <div className="product-card card-premium relative group bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <div className="relative bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 h-48 flex items-center justify-center overflow-hidden">
        {/* Discount Badge */}
        <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
          -{discountPercent}%
        </div>

        {/* Wishlist Icon */}
        {/* Wishlist Icon (top-left) */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(product) }}
          className={`absolute top-3 left-3 z-20 bg-white/80 hover:bg-white text-red-500 p-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md ${isFavorited(product._id) ? 'text-pink-500' : ''}`}
          aria-label={isFavorited(product._id) ? 'Remove favorite' : 'Add favorite'}
        >
          {isFavorited(product._id) ? '♥' : '♡'}
        </button>

        {/* Product Image or Icon with Hover Effect */}
        <div className="relative z-10 flex items-center justify-center w-full h-48">
          {product?.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-36 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
              📦
            </div>
          )}
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transform hover:scale-105 active:scale-95">
            Quick View
          </button>
        </div>
      </div>

      {/* Product Info */}
  <div onClick={() => navigate(`/products/${product._id}`)} className="p-4 relative z-10 cursor-pointer">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
          <span className="text-gray-600 text-xs ml-1">(234)</span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-sm md:text-base truncate text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {product.description}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {product.price?.toLocaleString() || 0} so'm
          </span>
          <span className="text-xs md:text-sm text-gray-500 line-through">
            {originalPrice.toLocaleString()} so'm
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleAddClick(e) }}
          disabled={loading}
          className="w-full btn-premium btn-primary px-3 py-2 rounded-lg font-bold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden text-sm md:text-base"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </>
          ) : (
            <>🛒 Add to Cart</>
          )}
        </button>
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-lg pointer-events-none">
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      </div>
    </div>
  )
}
