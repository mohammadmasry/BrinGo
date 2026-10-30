import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET
if (!secret) {
  throw new Error('JWT_SECRET is not set — refusing to start without it')
}

export interface TokenPayload {
  userId: string
  role: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret!, { expiresIn: '30d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret!) as TokenPayload
}
