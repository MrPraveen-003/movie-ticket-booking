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
      // MongoDB database mode
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
    } else {
      // Local fallback mode
      const existing = db.findUserByEmail(lowerEmail);
      if (existing) {
        res.status(400).json({ message: 'Email address already registered' });
        return;
      }

      const newUser = db.createUser(name, lowerEmail, password, 'user');
      const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });
      res.status(201).json({ user: newUser, token });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password required' });
      return;
    }

    const lowerEmail = email.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      // MongoDB database mode
      const User = mongoose.model('User');
      const user = await User.findOne({ email: lowerEmail }).select('+password') as any;
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials or password' });
        return;
      }

      // Read internal password from doc to compare
      const passwordRef = user.password;
      const isMatch = bcryptjs.compareSync(password, passwordRef);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials or password' });
        return;
      }

      const token = generateToken({ id: user._id.toString(), email: user.email, role: user.role as any });
      res.status(200).json({ user, token });
    } else {
      // Local fallback mode
      const user = db.findUserByEmail(lowerEmail);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials or password' });
        return;
      }

      const passwordHash = db.getPasswordHash(user.id);
      const isMatch = passwordHash ? bcryptjs.compareSync(password, passwordHash) : false;
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials or password' });
        return;
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      res.status(200).json({ user, token });
    }
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
      const User = mongoose.model('User');
      const user = await User.findById(req.user.id);
      res.json({ user });
    } else {
      const user = db.findUserById(req.user.id);
      res.json({ user });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Profile retrieval error', error: err.message });
  }
};
