import { Role } from '@/generated/prisma/enums';
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
