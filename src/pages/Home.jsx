import { useState, useEffect } from 'react'
import homeBg from '../assets/home-bg.jpg'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Badge, Button, Spinner } from 'flowbite-react'
import { HiArrowLeft, HiArrowRight, HiOutlineShoppingCart } from 'react-icons/hi'
import { productAPI } from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const location = useLocation()
  const justRegistered = location.state && location.state.justRegistered
  const [recommended, setRecommended] = useState([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)

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

  useEffect(() => {
    if (justRegistered) {
      setLoadingRecommended(true)
      productAPI.getAll()
        .then((products) => {
          // For demo, just pick first 4 products as recommended
          setRecommended(Array.isArray(products) ? products.slice(0, 4) : [])
        })
        .catch(() => setRecommended([]))
        .finally(() => setLoadingRecommended(false))
    }
  }, [justRegistered])

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${homeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
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


      {/* SITE INFO SECTION */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white/80 rounded-2xl shadow-lg mt-12">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Welcome to UniBozor!</h2>
        <p className="text-lg text-gray-700 mb-6">
          UniBozor is your one-stop online marketplace for students and the university community. Buy, sell, and discover a wide range of products, from electronics and fashion to books and more. Enjoy a secure, user-friendly platform designed to make campus trading easy and safe.
        </p>
        <ul className="text-left text-base text-gray-800 mx-auto max-w-2xl mb-6 list-disc list-inside">
          <li>🛒 Buy and sell new or used items with ease</li>
          <li>🔒 Safe and secure transactions</li>
          <li>🚚 Fast delivery and easy returns</li>
          <li>💬 Chat with sellers and buyers directly</li>
          <li>🎓 Built for students, by students</li>
        </ul>
        <div className="mt-8">
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Join Now
          </Link>
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS AFTER REGISTRATION */}
      {justRegistered && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">Recommended for You</h2>
          {loadingRecommended ? (
            <div className="flex justify-center items-center h-32">
              <Spinner size="xl" />
            </div>
          ) : recommended.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recommended.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">No recommendations available.</div>
          )}
        </div>
      )}

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
