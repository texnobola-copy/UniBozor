import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Badge, Button } from 'flowbite-react'
import { HiArrowLeft, HiArrowRight, HiOutlineShoppingCart } from 'react-icons/hi'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      id: 1,
      title: 'Summer Collection',
      subtitle: 'Up to 70% OFF',
      color: 'from-pink-500 via-purple-500 to-pink-600',
      icon: '🔥'
    },
    {
      id: 2,
      title: 'Exclusive Deals',
      subtitle: 'Limited Time Only',
      color: 'from-blue-500 via-cyan-500 to-blue-600',
      icon: '⚡'
    },
    {
      id: 3,
      title: 'Flash Sale',
      subtitle: 'Today Only',
      color: 'from-orange-500 via-yellow-500 to-orange-600',
      icon: '💥'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
  {/* HERO CAROUSEL */}
  <div className="relative w-full h-64 sm:h-72 md:h-96 overflow-hidden rounded-lg shadow-2xl m-4">
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-r ${slide.color} transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-40 -right-40 blur-3xl"></div>
              <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-40 -left-40 blur-3xl"></div>
            </div>

            {/* Slide Content */}
            <div className="relative h-full flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">{slide.icon}</div>
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mb-1 sm:mb-2">{slide.title}</h1>
                <p className="text-base sm:text-lg md:text-3xl font-bold opacity-90">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur flex items-center justify-center"
        >
          <HiArrowLeft size={28} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur flex items-center justify-center"
        >
          <HiArrowRight size={28} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-3'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* QUICK CATEGORIES BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex gap-3 sm:gap-4 overflow-x-auto">
          {[
            { name: 'Hot Deals', icon: '🔥' },
            { name: 'Electronics', icon: '📱' },
            { name: 'Fashion', icon: '👗' },
            { name: 'Home & Garden', icon: '🏠' },
            { name: 'Beauty', icon: '💄' },
            { name: 'Sports', icon: '⚽' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to="/categories"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 whitespace-nowrap font-medium text-sm border border-gray-200"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black text-gray-900">🔥 Hot Deals</h2>
            <p className="text-gray-600 mt-2">Limited time offers - Don't miss out!</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            View All <HiArrowRight />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((product) => (
            <div
              key={product}
              className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group border border-gray-100"
            >
              {/* Product Image Container */}
              <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 h-40 sm:h-48 md:h-56 flex items-center justify-center overflow-hidden">
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge color="red" className="text-sm font-bold">
                    -40%
                  </Badge>
                </div>

                {/* Product Icon */}
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {['📱', '💻', '🎧', '⌚', '📷', '🎮', '💡', '🖱️'][product % 8]}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Button
                    color="primary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Quick View
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 truncate mb-2">
                  Premium Product {product}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                  <span className="text-gray-600 text-sm">(234)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                    {999 + product * 100} so'm
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {Math.round((999 + product * 100) * 1.67)} so'm
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  color="success"
                  className="w-full"
                >
                  🛒 Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROMOTIONAL BANNER */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 bg-white rounded-full -top-40 -left-40"></div>
            <div className="absolute w-96 h-96 bg-white rounded-full -bottom-40 -right-40"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              🎁 Special Offer for Members
            </h2>
            <p className="text-xl md:text-2xl mb-6 opacity-95">
              Get 30% off on your first order - Sign up now!
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign Up & Save 30%
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Same day delivery available' },
              { icon: '💯', title: 'Original Products', desc: '100% authentic guarantee' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Safe transactions' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
