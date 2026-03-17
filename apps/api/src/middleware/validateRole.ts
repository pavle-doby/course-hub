import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from 'api/types/errors';
import { usersService } from 'api/modules/users/services/usersService';
import type { UserRole } from '@my/contract';

/**
 * Middleware to validate user role
 * Requires the handleAuth middleware to be called first to set res.locals.user
 *
 * @param requiredRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export function validateRole(requiredRoles: UserRole[]) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    // Get user details from database to fetch the role
    const user = await usersService.getByEmail(res.locals.user.email);

    // Check if user role is in the required roles
    if (!requiredRoles.some((r) => r === user.role)) {
      const error = new ForbiddenError();
      res.status(error.status).json(error);
      return;
    }

    // Store the full user object in res.locals for potential use in controllers
    res.locals.self = user;

    next();
  };
}

/**
 * Convenience middleware to validate admin role only
 */
export const validateAdminRole = () => validateRole(['admin']);

/**
 * Convenience middleware to validate user or admin role
 */
export const validateUserRole = () => validateRole(['user', 'admin']);
