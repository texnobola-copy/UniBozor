import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productAPI } from '../api/client'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [rating, setRating] = useState(5)
  const { addToCart } = useCart()
  const { isFavorited, toggleFavorite } = useFavorites()

  useEffect(() => {
    fetchProduct()
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const data = await productAPI.getById(id)
      setProduct(data)
      setError('')
    } catch (err) {
      setError('Failed to load product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const commentsKey = `comments_${id}`
  const loadComments = () => {
    try {
      const raw = localStorage.getItem(commentsKey)
      setComments(raw ? JSON.parse(raw) : [])
    } catch (err) {
      setComments([])
    }
  }

  const saveComments = (next) => {
    try {
      localStorage.setItem(commentsKey, JSON.stringify(next))
    } catch (err) {
      // ignore
    }
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const newComment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      rating,
      createdAt: new Date().toISOString(),
    }
    const next = [newComment, ...comments]
    setComments(next)
    saveComments(next)
    setCommentText('')
    setRating(5)
  }

  const avgRating = comments.length ? (comments.reduce((s, c) => s + (c.rating || 0), 0) / comments.length).toFixed(1) : null

  if (loading) return <div className="p-8">Loading...</div>
  if (!product) return <div className="p-8">{error || 'Product not found'}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 grid md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center border rounded p-4">
            {product.image ? (
              <img src={product.image} alt={product.name} className="max-h-80 object-contain" />
            ) : (
              <div className="text-6xl">📦</div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-yellow-500 font-bold">{avgRating ? `${avgRating} ★` : 'No ratings yet'}</div>
              <div className="text-gray-500">{comments.length} reviews</div>
            </div>

            <div className="text-2xl font-extrabold text-gray-900 mb-4">{product.price?.toLocaleString() || 0} so'm</div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex gap-3 mb-4">
              <button onClick={() => addToCart(product._id, 1, product)} className="px-4 py-2 bg-green-600 text-white rounded">🛒 Add to Cart</button>
              <button onClick={() => toggleFavorite(product)} className={`px-4 py-2 rounded border ${isFavorited(product._id) ? 'bg-pink-500 text-white' : 'bg-white'}`}>
                {isFavorited(product._id) ? '♥ Favorited' : '♡ Favorite'}
              </button>
            </div>

            <hr className="my-4" />

            <h3 className="text-xl font-bold mb-3">Reviews</h3>
            <form onSubmit={handleAddComment} className="mb-6 space-y-3">
              <div>
                <label className="block text-sm text-gray-700">Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-1 p-2 border rounded">
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Comment</label>
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full border p-2 rounded" rows={3} />
              </div>

              <div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Post Review</button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-gray-500">No reviews yet.</div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="font-bold">User</div>
                      <div className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-yellow-500 font-bold">{c.rating} ★</div>
                    <div className="text-gray-700 mt-2">{c.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
