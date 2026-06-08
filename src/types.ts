import { Request } from 'express';
import { Types } from 'mongoose';

export interface IJwtPayload {
  userId: string;
  email: string;
}


export interface AuthenticatedRequest extends Request {
  user: {
    id: Types.ObjectId;
    email: string;
  };
}

export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return (
    (req as AuthenticatedRequest).user !== undefined &&
    (req as AuthenticatedRequest).user?.id instanceof Types.ObjectId
  );
}