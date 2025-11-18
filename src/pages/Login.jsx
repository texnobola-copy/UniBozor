import { useState } from 'react'
import loginBg from '../assets/login.jpg'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TextInput, Button, Label, Card, Alert, Checkbox } from 'flowbite-react'
import { HiInformationCircle, HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Basic validation
      if (!username.trim() || !password.trim()) {
        setError('Username and password are required')
        setLoading(false)
        return
      }

      if (password.length < 3) {
        setError('Password must be at least 3 characters')
        setLoading(false)
        return
      }

      // Call login from auth context
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  const [rememberMe, setRememberMe] = useState(false)

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-40 -right-40"></div>
          <div className="absolute w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -bottom-40 -left-40"></div>
        </div>

        <Card className="shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert color="failure" icon={HiInformationCircle} className="mb-6">
              <span className="font-medium">{error}</span>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <Label htmlFor="username" className="mb-2 block font-semibold">
                Username
              </Label>
              <TextInput
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={HiOutlineUser}
                disabled={loading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <Link to="#" className="text-blue-600 hover:underline text-sm font-semibold">
                  Forgot password?
                </Link>
              </div>
              <TextInput
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={HiOutlineLockClosed}
                disabled={loading}
                required
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium text-gray-700">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold py-3"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-4">
            <Button color="light" className="font-bold text-lg">
              🐙
            </Button>
            <Button color="light" className="font-bold text-lg">
              🔵
            </Button>
            <Button color="light" className="font-bold text-lg">
              🔴
            </Button>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-bold transition-colors"
            >
              Create one now
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
