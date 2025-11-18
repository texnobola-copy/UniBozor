import { useState } from 'react'
import registerBg from '../assets/register.jpg'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company
      })
  navigate('/', { state: { justRegistered: true } })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${registerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">Join our marketplace today</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="relative z-0 w-full group">
          <input
            type="email"
            name="email"
            id="floating_email"
            value={formData.email}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            placeholder=" "
            required
            disabled={loading}
          />
          <label
            htmlFor="floating_email"
            className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Email address
          </label>
        </div>

        {/* Password */}
        <div className="relative z-0 w-full group">
          <input
            type="password"
            name="password"
            id="floating_password"
            value={formData.password}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            placeholder=" "
            required
            disabled={loading}
          />
          <label
            htmlFor="floating_password"
            className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Password
          </label>
        </div>

        {/* Confirm Password */}
        <div className="relative z-0 w-full group">
          <input
            type="password"
            name="confirmPassword"
            id="floating_repeat_password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            placeholder=" "
            required
            disabled={loading}
          />
          <label
            htmlFor="floating_repeat_password"
            className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Confirm password
          </label>
        </div>

        {/* Name Fields */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full group">
            <input
              type="text"
              name="firstName"
              id="floating_first_name"
              value={formData.firstName}
              onChange={handleChange}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
              required
              disabled={loading}
            />
            <label
              htmlFor="floating_first_name"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              First name
            </label>
          </div>
          <div className="relative z-0 w-full group">
            <input
              type="text"
              name="lastName"
              id="floating_last_name"
              value={formData.lastName}
              onChange={handleChange}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
              required
              disabled={loading}
            />
            <label
              htmlFor="floating_last_name"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Last name
            </label>
          </div>
        </div>

        {/* Phone & Company */}
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full group">
            <input
              type="tel"
              name="phone"
              id="floating_phone"
              value={formData.phone}
              onChange={handleChange}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
              disabled={loading}
            />
            <label
              htmlFor="floating_phone"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Phone number
            </label>
          </div>
          <div className="relative z-0 w-full group">
            <input
              type="text"
              name="company"
              id="floating_company"
              value={formData.company}
              onChange={handleChange}
              className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
              disabled={loading}
            />
            <label
              htmlFor="floating_company"
              className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Company (Ex. Google)
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
        >
          {loading ? 'Creating...' : 'Submit'}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Login here
          </Link>
        </p>
      </form>
    </div>
  )
}