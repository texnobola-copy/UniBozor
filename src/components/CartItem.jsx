import { useState, useEffect } from 'react'
import { productAPI } from '../api/client'

export default function CartItem({ item, onRemove, loading }) {
  const [product, setProduct] = useState(item.product || item.productId || {})
  const [fetchingProduct, setFetchingProduct] = useState(false)

  // If product details are missing, fetch them
  useEffect(() => {
    if (!product.name && item.productId && typeof item.productId === 'string') {
      setFetchingProduct(true)
      productAPI.getById(item.productId)
        .then(data => {
          setProduct({ id: data._id, name: data.name, price: data.price })
        })
        .catch(err => {
          console.error('DEBUG: Failed to fetch product:', err)
          // Keep existing product state
        })
        .finally(() => setFetchingProduct(false))
    }
  }, [item.productId, product.name])

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow mb-3 border border-gray-200">
      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-bold text-lg">{product.name || 'Loading...'}</h3>
        <p className="text-gray-600 text-sm">{product.price || 0} so'm x {item.quantity}</p>
        <p className="text-blue-600 font-bold text-lg">
          Total: {(product.price || 0) * item.quantity} so'm
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove && onRemove()}
        disabled={loading || fetchingProduct}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50 ml-4"
      >
        {loading || fetchingProduct ? '...' : 'Remove'}
      </button>
    </div>
  )
}
