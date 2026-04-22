import { type UserRole } from "../../modules/user/user.schema.ts"   

export interface JwtPayload {
  username?: string,
  email?: string,
  id: string,
  role: UserRole,
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

