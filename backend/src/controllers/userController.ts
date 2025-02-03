import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../database/db';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middlewares/authMiddlewares';
import path from 'path';
import fs from 'fs';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if (!['candidate', 'recruiter'].includes(role)) {
    res.status(400).json({ message: 'Invalid role. Allowed roles are "candidate" or "recruiter".' });
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.'
    });
    return;
  }


  try {
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, role',
      [name, email.trim().toLowerCase(), hashedPassword, role]
    );

    res.status(201).json({ userId: result.rows[0].id, role: result.rows[0].role, message: 'User registered successfully' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' });

    res.json({
      token,
      role: user.role,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await db.query('SELECT id, name, last_name, role, profile_picture FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];

    res.json(user);
    return;
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error', error });
    return;
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;
    const recruiter = await db.query(
      'SELECT name, last_name, position, email, profile_picture FROM users WHERE id = $1',
      [recruiterId]
    );
    res.json(recruiter.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const recruiterId = req.user?.id;
    const { name, last_name, position } = req.body;
    let profile_picture = null;

    if (req.file) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      const filePath = path.join(uploadsDir, req.file.filename);
      profile_picture = `/uploads/${req.file.filename}`;
      console.log('Saving file:', filePath);
    }

    await db.query(
      'UPDATE users SET name = $1, last_name = $2, position = $3, profile_picture = $4 WHERE id = $5',
      [name, last_name, position, profile_picture, recruiterId]
    );

    const updatedUser = await db.query(
      'SELECT id, name, last_name, position, email, profile_picture FROM users WHERE id = $1',
      [recruiterId]
    );

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.',
      });
      return;
    }

    const userResult = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

