import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../models/User';
import { CategoryModel } from '../models/Category';
import currencyService from '../services/currencyService';

const userModel = new UserModel();
const categoryModel = new CategoryModel();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    // Create default categories for the user
    await categoryModel.createDefaultCategories(userId);

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId }, secret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Update user with reset token
    await userModel.updateResetToken(email, resetToken, resetTokenExpiry);

    // In a real application, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'If the email exists, a reset link has been sent',
      // Remove this in production - only for development
      resetToken
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Find user by reset token
    const user = await userModel.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await userModel.updatePassword(user.email, hashedPassword);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const autoLogin = async (req: Request, res: Response) => {
  try {
    // Always login as user ID 1 (default user)
    const user = await userModel.findById(1);

    if (!user) {
      return res.status(500).json({ error: 'Default user not found. Please restart the application.' });
    }

    // Generate JWT token for the default user
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: 1 }, secret, { expiresIn: '30d' });

    res.json({
      message: 'Auto-login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('Auto-login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCurrency = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId;
    const { currency } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!currency) {
      return res.status(400).json({ error: 'Currency is required' });
    }

    if (!currencyService.isValidCurrency(currency)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    await userModel.updateCurrency(userId, currency);

    res.json({
      message: 'Currency updated successfully',
      currency
    });
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSupportedCurrencies = async (req: Request, res: Response) => {
  try {
    const currencies = Object.values(currencyService.SUPPORTED_CURRENCIES);
    res.json({ currencies });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkSetup = async (req: Request, res: Response) => {
  try {
    const hasPassword = await userModel.hasPassword();
    res.json({ hasPassword });
  } catch (error) {
    console.error('Check setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setupPassword = async (req: Request, res: Response) => {
  try {
    const { password, currency } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (currency && !currencyService.isValidCurrency(currency)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    // Check if password is already set
    const hasPassword = await userModel.hasPassword();
    if (hasPassword) {
      return res.status(400).json({ error: 'Password has already been set' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set password
    await userModel.setInitialPassword(hashedPassword);

    // Set currency if provided
    if (currency) {
      await userModel.updateCurrency(1, currency);
    }

    // Generate JWT token for the user
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: 1 }, secret, { expiresIn: '30d' });

    // Get user data
    const user = await userModel.findById(1);

    res.json({
      message: 'Password set successfully',
      token,
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        currency: user!.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginWithPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get user
    const user = await userModel.findById(1);
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Password not set. Please set up your password first.' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: 1 }, secret, { expiresIn: '30d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('Login with password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};