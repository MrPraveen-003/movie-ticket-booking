import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { db } from '../../db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify user exists in the active database
    if (mongoose.connection.readyState === 1) {
      // MongoDB mode
      const User = mongoose.model('User');
      const userExists = await User.findById(decoded.id);
      if (!userExists) {
        res.status(401).json({ message: 'User no longer exists in database' });
        return;
      }
    } else {
      // Falling back to local file state
      const userExists = db.findUserById(decoded.id);
      if (!userExists) {
        res.status(401).json({ message: 'User no longer exists' });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
};
