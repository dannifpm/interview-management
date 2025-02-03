import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtUserPayload extends JwtPayload {
  id: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload; 
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload; 
    req.user = user; 
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== requiredRole) {
      res.status(403).json({ message: 'Forbidden: Access is denied.' });
      return;
    }
    next();
  };
};
