import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { BadRequestError, AppError } from './error';
import { IJwtPayload, AuthenticatedRequest } from './types';

const JWT_SECRET = process.env.JWT_SECRET;

class UnauthorizedError extends AppError {
  constructor(message: string = 'Access denied. Invalid or missing token.') {
    super(401, message); 
  }
}

export function authGuard(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization token required using Bearer format');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as IJwtPayload;
    
    (req as AuthenticatedRequest).user = {
      id: new Types.ObjectId(decoded.userId),
      email: decoded.email
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Session expired or authentication token is invalid'));
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  const { method, url, ip } = req;
  
  console.log(`[${timestamp}] ${method} request sent to ${url} from ${ip}`);
  
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${method} ${url} responded with status ${res.statusCode} (${duration}ms)`);
  });

  next();
}

export function validateBody<T>(requiredFields: (keyof T)[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body as T;
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!body || body[field] === undefined || body[field] === null) {
        missingFields.push(String(field));
      }
    }

    if (requiredFields.includes('category' as keyof T) && body && (body as any).category) {
      if (!(body as any).category.name) {
        missingFields.push('category.name');
      }
    }

    if (missingFields.length > 0) {
      throw new BadRequestError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    next();
  };
}