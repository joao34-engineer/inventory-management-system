import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/login.ts'
import { Input, Button } from '@shared/ui'
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from '@shared/ui/Icon'
import './LoginForm.css'

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form focus issues
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch(err: unknown ) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        leftIcon={<EmailIcon size={20} />}
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        leftIcon={<LockIcon size={20} />}
        rightIcon={
          <button
            type="button" // Critical: prevents form submission
            className="password-toggle-btn"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        }
      />

      <div className="flex-row">
        <div>
          <input type="checkbox" id="remember" />
          <label htmlFor="remember" className="remember-label">Remember me</label>
        </div>
        <span className="span">Forgot password?</span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <Button type="submit" className="button-submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}