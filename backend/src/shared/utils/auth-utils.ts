import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import env from '../../env.ts'
import { createSecretKey } from 'crypto'
import { type JwtPayload } from '../authenticationTypes/authTypes.ts'


export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS)
}

export const comparePassword = async (password: string, hashedPassword: string) =>{
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JwtPayload) => {
  const secret = env.JWT_SECRET
  const secretKey = createSecretKey(secret, 'utf-8')

  return new SignJWT(payload)
  .setProtectedHeader({alg: 'HS256'})
  .setIssuedAt()
  .setExpirationTime(env.JWT_EXPIRES_IN || '17d')
  .sign(secretKey)
}

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = createSecretKey(env.JWT_SECRET, 'utf-8')
  const {payload}: {payload: JwtPayload} = await jwtVerify(token, secretKey)
  return payload
}