import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  console.log('Auth lib: Generating token with JWT_SECRET:', process.env.JWT_SECRET)
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log('Auth lib: Verifying token with JWT_SECRET:', process.env.JWT_SECRET)
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    console.error('Auth lib: Token verification error:', error)
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
} 