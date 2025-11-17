import { useEffect } from 'react'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites()
  const { addToCart, loading: cartLoading } = useCart()

  useEffect(() => {
    // page ready
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Favorites</h1>

        {favorites.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center">
            <p className="text-gray-600">You haven't favorited any products yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
              <div key={product._id} className="relative">
                <ProductCard product={product} onAddToCart={() => addToCart(product._id, 1, product)} loading={cartLoading} />
                <div className="absolute top-3 right-3">
                  <button onClick={() => removeFavorite(product._id)} className="bg-white px-3 py-1 rounded text-sm text-red-600 border">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
