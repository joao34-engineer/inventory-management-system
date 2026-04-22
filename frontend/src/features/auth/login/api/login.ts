import  { apiFetch } from '@shared/api/api.ts'
import type { AuthResponse, User } from '@entities/user/model/types.ts'


export async function login(email: string, password: string): Promise<User> {

  const response = await apiFetch<AuthResponse>('/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

  localStorage.setItem('auth_token', response.token)

  return response.data
}