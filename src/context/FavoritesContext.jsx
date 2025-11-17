import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])

  const storageKey = () => {
    if (user && (user.id || user._id)) return `favorites_${user.id || user._id}`
    return 'favorites_guest'
  }

  useEffect(() => {
    // load from localStorage for current user
    try {
      const raw = localStorage.getItem(storageKey())
      if (raw) setFavorites(JSON.parse(raw))
      else setFavorites([])
    } catch (err) {
      setFavorites([])
    }
  }, [user])

  useEffect(() => {
    // persist whenever favorites change
    try {
      localStorage.setItem(storageKey(), JSON.stringify(favorites))
    } catch (err) {
      // ignore
    }
  }, [favorites, user])

  const addFavorite = (product) => {
    if (!product) return
    setFavorites((prev) => {
      const exists = prev.find((p) => p._id === product._id)
      if (exists) return prev
      return [product, ...prev]
    })
  }

  const removeFavorite = (productId) => {
    setFavorites((prev) => prev.filter((p) => p._id !== productId))
  }

  const toggleFavorite = (product) => {
    if (!product) return
    const exists = favorites.find((p) => p._id === product._id)
    if (exists) removeFavorite(product._id)
    else addFavorite(product)
  }

  const isFavorited = (productId) => favorites.some((p) => p._id === productId)

  const value = {
    favorites,
    favoritesCount: favorites.length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
