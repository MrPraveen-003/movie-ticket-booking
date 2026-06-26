import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { generateToken } from '../utils/jwt';
import { db } from '../../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Missing required registration parameters' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const lowerEmail = email.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      try {
        const User = mongoose.model('User');
        const existing = await User.findOne({ email: lowerEmail });
        if (existing) {
          res.status(400).json({ message: 'Email address already registered' });
          return;
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = await User.create({
          name,
          email: lowerEmail,
          password: hashedPassword,
          role: 'user'
        }) as any;

        const token = generateToken({ id: newUser._id.toString(), email: newUser.email, role: 'user' });
        res.status(201).json({ user: newUser, token });
        return;
      } catch (mongoErr: any) {
        console.warn('Mongo registration failed, falling back to local JSON database:', mongoErr.message);
      }
    }

    const existing = db.findUserByEmail(lowerEmail);
    if (existing) {
      res.status(400).json({ message: 'Email address already registered' });
      return;
    }

    const newUser = db.createUser(name, lowerEmail, password, 'user');
    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password required' });
      return;
    }

    const requestedRole = (role || 'user').toLowerCase();
    if (requestedRole !== 'user' && requestedRole !== 'admin') {
      res.status(400).json({ message: 'Invalid login role selected' });
      return;
    }

    const lowerEmail = email.toLowerCase();
    let authenticatedUser: any = null;
    let authMode: 'mongo' | 'local' | null = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const User = mongoose.model('User');
        const user = await User.findOne({ email: lowerEmail }).select('+password') as any;
        if (user) {
          const passwordRef = user.password;
          const isMatch = bcryptjs.compareSync(password, passwordRef);
          if (isMatch) {
            if (user.role !== requestedRole) {
              res.status(403).json({
                message: requestedRole === 'admin'
                  ? 'This account is not authorized for admin login.'
                  : 'This account is not authorized for user login.'
              });
              return;
            }

            authenticatedUser = user;
            authMode = 'mongo';
          }
        }
      } catch (mongoErr: any) {
        console.warn('Mongo auth lookup failed, falling back to local JSON database:', mongoErr.message);
      }
    }

    if (!authenticatedUser) {
      const localUser = db.findUserByEmail(lowerEmail);
      if (localUser) {
        const passwordHash = db.getPasswordHash(localUser.id);
        const isMatch = passwordHash ? bcryptjs.compareSync(password, passwordHash) : false;
        if (isMatch) {
          if (localUser.role !== requestedRole) {
            res.status(403).json({
              message: requestedRole === 'admin'
                ? 'This account is not authorized for admin login.'
                : 'This account is not authorized for user login.'
            });
            return;
          }

          authenticatedUser = localUser;
          authMode = 'local';
        }
      }
    }

    if (!authenticatedUser) {
      res.status(401).json({ message: 'Invalid credentials or password' });
      return;
    }

    const token = generateToken({
      id: authenticatedUser._id?.toString?.() || authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role as any
    });

    res.status(200).json({ user: authenticatedUser, token });
  } catch (err: any) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const User = mongoose.model('User');
        const user = await User.findById(req.user.id);
        if (user) {
          res.json({ user });
          return;
        }
      } catch (mongoErr: any) {
        console.warn('Mongo profile lookup failed, falling back to local JSON database:', mongoErr.message);
      }
    }

    const user = db.findUserById(req.user.id);
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ message: 'Profile retrieval error', error: err.message });
  }
};
