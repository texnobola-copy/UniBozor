import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { cartCount } = useCart()
  const { favoritesCount } = useFavorites()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const { lang, setLang } = useLanguage()
  const { t } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    const check = () => {
      const touch = typeof window !== 'undefined' && (('ontouchstart' in window) || navigator.maxTouchPoints > 0)
      const narrow = typeof window !== 'undefined' && window.innerWidth < 768
      setIsMobileView(Boolean(touch || narrow))
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
  <nav className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-b border-gray-200 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <span className="hidden sm:inline text-xl font-bold">{t('brand')}</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-6 max-w-md">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          <div className="flex items-center gap-3">
            {/* Mobile menu button (render only in mobile-like view) */}
            {isMobileView ? (
              <>
                <button
                  onClick={() => setMobileOpen((s) => !s)}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                  aria-label="Toggle menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link to="/cart" className="inline-flex relative text-gray-700 hover:text-blue-600">
                  <span className="text-2xl">🛒</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/favorites" className="inline-flex relative text-gray-700 hover:text-pink-600">
                  <span className="text-2xl">❤</span>
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

                <Link to="/orders" className="inline-flex px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                  📦 {t('orders')}
                </Link>

                <Link to="/sell" className="inline-flex px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1">
                  💸 <span className="ml-1">{user?.role === 'seller' ? t('myStore') : t('sell')}</span>
                </Link>

                {(user?.role === 'admin' || user?.role === 'admin-seller') && (
                  <Link to="/admin" className="inline-flex px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                    ⚙️ {t('admin')}
                  </Link>
                )}

                {/* Profile / Login */}
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="inline-flex px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1">
                      👤 <span className="ml-1">{user?.username || t('profile')}</span>
                    </Link>
                    <button onClick={handleLogout} className="inline-block bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="inline-flex px-3 py-1 bg-blue-600 text-white rounded">{t('login')}</Link>
                    <Link to="/register" className="inline-flex px-3 py-1 bg-green-600 text-white rounded">{t('register')}</Link>
                  </>
                )}
                {/* Language selector */}
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setLangOpen((s) => !s)}
                    className="ml-2 px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                    aria-haspopup="true"
                    aria-expanded={langOpen}
                  >
                    {lang === 'en' ? 'EN' : lang === 'uz' ? 'UZ' : 'RU'}
                  </button>
                  {langOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button onClick={() => { setLang('en'); setLangOpen(false) }} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">English</button>
                        <button onClick={() => { setLang('uz'); setLangOpen(false) }} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">O'zbek</button>
                        <button onClick={() => { setLang('ru'); setLangOpen(false) }} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100">Русский</button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu containing all actions */}
      {mobileOpen && isMobileView && (
        // Use fixed positioning on mobile so the dropdown appears under the navbar
        // even inside device/simulator extensions. Limit height and allow scrolling.
        <div className="md:hidden fixed left-0 top-16 w-full bg-white border-t border-gray-200 z-40 max-h-[calc(100vh-4rem)] overflow-auto">
          <div className="px-4 py-3 space-y-3">
            {/* search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg">Search</button>
            </form>

            {/* actions */}
            <div className="grid grid-cols-1 gap-2">
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50">
                <span>🛒 Cart</span>
                <span className="text-sm text-gray-600">{cartCount}</span>
              </Link>
              <Link to="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50">
                <span>❤ Favorites</span>
                <span className="text-sm text-gray-600">{favoritesCount}</span>
              </Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">📦 Orders</Link>
              <Link to="/sell" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">💸 {user?.role === 'seller' ? 'My Store' : 'Sell'}</Link>
              {(user?.role === 'admin' || user?.role === 'admin-seller') && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">⚙️ Admin</Link>
              )}
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded hover:bg-gray-50">👤 {user?.username || 'Profile'}</Link>
              <button onClick={() => { setMobileOpen(false); handleLogout() }} className="w-full text-left px-3 py-2 rounded bg-red-500 text-white">Logout</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
                  {/* actions */}
