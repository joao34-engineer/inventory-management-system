import type { User } from "@entities/user/model/types.ts"

export type RegisterInput = Pick<User, 'username' | 'email' | 
'firstName' | 'lastName'> & {
  password: string
}

export interface RegisterResponse {
  status: 'success' | 'error'
  data: User
  message?: string
}