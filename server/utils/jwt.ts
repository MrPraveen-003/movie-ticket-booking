import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'MOVIEBOOK_SUPER_SECRET_KEY_2026_JWT';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
