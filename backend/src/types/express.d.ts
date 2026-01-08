import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface UserContext {
      id: string;
      name: string;
      email: string;
      role: Role;
      branchId?: string | null;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export {};

