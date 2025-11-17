import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI } from '../api/client'
import { categoryAPI } from '../api/client'

export default function AddProduct() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    categoryAPI.getAll().then(data => {
      if (mounted) setCategories(data)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { name, price: Number(price), description, image, category }
      await productAPI.create(data)
      navigate('/products')
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Sell a new product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="w-full border px-3 py-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input type="number" className="w-full border px-3 py-2 rounded" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select className="w-full border px-3 py-2 rounded" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">— Select category —</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input className="w-full border px-3 py-2 rounded" value={image} onChange={e => setImage(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className="w-full border px-3 py-2 rounded" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Creating...' : 'Create product'}
          </button>
        </div>
      </form>
    </div>
  )
}
