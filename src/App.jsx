import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Categories from './pages/Categories'
import AddProduct from './pages/AddProduct'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ProductDetails from './pages/ProductDetails'
import Favorites from './pages/Favorites'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Admin Route Component (requires x-admin-id header in API calls)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, userId } = useAuth()

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  // Admin check is done via x-admin-id header in API calls
  // In a real app, you'd validate admin status from backend
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Routes component
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/categories" element={<Categories />} />
      
      {/* Cart should be viewable by guests (uses guest_cart localStorage) */}
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      {/* Seller route to add products */}
      <Route
        path="/sell"
        element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route path="/favorites" element={<Favorites />} />
  <Route path="/products/:id" element={<ProductDetails />} />

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <LanguageProvider>
              <div className="min-h-screen bg-white text-gray-900">
                <Navbar />
                <AppRoutes />
              </div>
            </LanguageProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
