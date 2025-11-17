import { Link } from 'react-router-dom'

export default function CategoryCard({ category }) {
  return (
    <Link to={`/categories/${category._id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 text-center hover:scale-105 cursor-pointer border-l-4 border-l-blue-500 group">
        {/* Icon */}
        <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">📂</div>
        
        {/* Category Name */}
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</h3>
        
        {/* Slug */}
        <p className="text-gray-500 text-sm">→ Browse collection</p>
      </div>
    </Link>
  )
}
