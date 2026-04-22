import React, { useState } from 'react'
import { register } from '../api/register.ts'
import { type RegisterInput } from '../register.types/registerType.ts'
import { Input, Button } from '@shared/ui'
import { UserIcon, EmailIcon, LockIcon } from '@shared/ui/Icon'
import './RegisterForm.css'

interface RegisterFormProps {
  onSuccess?: () => void
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterInput>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await register(formData)
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occured'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className='auth-form' onSubmit={handleSubmit}>
      <Input
        label='Username'
        name='username'
        placeholder="Choose username"
        value={formData.username}
        onChange={handleChange}
        required
        leftIcon={<UserIcon size={18} />}
      />

      <Input
        label='Email'
        type='email'
        name='email'
        placeholder='Enter email'
        value={formData.email}
        onChange={handleChange}
        required
        leftIcon={<EmailIcon size={18} />}
      />

      <div className='name-row'>
        <Input
          label='First Name'
          name='firstName'
          placeholder='John'
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <Input
          label='Last Name'
          name='lastName'
          placeholder='Doe'
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label='Password'
        type='password'
        name='password'
        placeholder='Create password'
        value={formData.password}
        onChange={handleChange}
        required
        leftIcon={<LockIcon size={18} />}
      />

      {error && <p className='error-message'>{error}</p>}
      {success && <p className='success-message'>✅ Conta criada com sucesso!</p>}

      <Button type='submit' className="button-submit" disabled={isLoading || success}>
        {isLoading ? 'Criando...' : success ? 'Redirecionando...' : 'Criar conta'}
      </Button>
    </form>
  )
}
