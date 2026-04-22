import type { RegisterInput, RegisterResponse } from "../register.types/registerType.ts"
import { apiFetch } from "@shared/api/api.ts"
import { type User } from "@entities/user/model/types.ts"

export const register = async (data: RegisterInput): Promise<User> => {
  const response = await apiFetch<RegisterResponse>('/user/register',{
    method: 'POST',
    body: JSON.stringify(data)
  })

  if (response.status === 'error') {
    throw new Error(response.message || 'Failed to register')
  }

  return response.data
}
