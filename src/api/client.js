import axios from 'axios'

// Use Vite env variable so Netlify or other hosts can set the production API URL at build time
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - token ni header ga qo'shish
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  if (userId) {
    config.headers['x-user-id'] = userId
  }
  
  return config
})

// Response interceptor - errors handle qilish
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===== AUTH API =====
export const authAPI = {
  // register: email is used as username in backend
  register: (email, password, meta = {}) =>
    client.post('/auth/register', { username: email, password, email, ...meta }),
  login: (username, password) =>
    client.post('/auth/login', { username, password }),
}

// ===== PRODUCTS API =====
export const productAPI = {
  getAll: () => client.get('/products').then(res => res.data),
  getById: (id) => client.get(`/products/${id}`).then(res => res.data),
  create: (data) => client.post('/products', data).then(res => res.data),
  update: (id, data) => client.patch(`/products/${id}`, data).then(res => res.data),
  delete: (id) => client.delete(`/products/${id}`).then(res => res.data),
}

// ===== CATEGORIES API =====
export const categoryAPI = {
  getAll: () => client.get('/categories').then(res => res.data),
  getById: (id) => client.get(`/categories/${id}`).then(res => res.data),
  getByIdProducts: (id) => client.get(`/categories/${id}/products`).then(res => res.data),
  create: (data) => client.post('/categories', data).then(res => res.data),
  update: (id, data) => client.patch(`/categories/${id}`, data).then(res => res.data),
  delete: (id) => client.delete(`/categories/${id}`).then(res => res.data),
}

// ===== CART API =====
export const cartAPI = {
  getCart: () => client.get('/orders/cart').then(res => res.data),
  addToCart: (productId, quantity) =>
    client.post('/orders/cart/add', { productId, quantity }).then(res => res.data),
  removeFromCart: (productId) =>
    client.post('/orders/cart/remove', { productId }).then(res => res.data),
  clearCart: () => client.post('/orders/cart/clear').then(res => res.data),
}

export const orderAPI = {
  // Accept a full order object (items, totalPrice, shippingAddress, notes, ...)
  checkout: (orderData) =>
    client.post('/orders/checkout', orderData).then(res => res.data),
  getMyOrders: () => client.get('/orders/my-orders').then(res => res.data),
  getOrderById: (id) => client.get(`/orders/${id}`).then(res => res.data),
  cancelOrder: (id) => client.post(`/orders/${id}/cancel`).then(res => res.data),
}

// ===== USERS API =====
export const userAPI = {
  getProfile: () => client.get('/users/profile').then(res => res.data),
  updateProfile: (data) => client.patch('/users/profile', data).then(res => res.data),
  // Accept a payload object: { currentPassword, newPassword } or { oldPassword, newPassword }
  changePassword: (payload) =>
    client.post('/users/change-password', payload).then(res => res.data),
  getUserById: (id) => client.get(`/users/${id}`).then(res => res.data),
  becomeSeller: () => client.post('/users/become-seller').then(res => res.data),
}

// ===== ADMIN API =====
export const adminAPI = {
  // Products
  createProduct: (data) => client.post('/admin/products', data).then(res => res.data),
  updateProduct: (id, data) => client.patch(`/admin/products/${id}`, data).then(res => res.data),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`).then(res => res.data),
  
  // Categories
  createCategory: (data) => client.post('/admin/categories', data).then(res => res.data),
  updateCategory: (id, data) => client.patch(`/admin/categories/${id}`, data).then(res => res.data),
  deleteCategory: (id) => client.delete(`/admin/categories/${id}`).then(res => res.data),
  
  // Orders
  getAllOrders: () => client.get('/admin/orders').then(res => res.data),
  updateOrderStatus: (id, data) =>
    client.patch(`/admin/orders/${id}`, data).then(res => res.data),
}

export default client
