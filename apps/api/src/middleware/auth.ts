import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, InternalServerError } from 'api/types/errors';
import { supabase } from 'api/utils/supabase';
import { ErrorCode } from '@my/contract';
import { email } from 'zod';

/**
 * Checks if Supabase `token` is valid and user is authenticated
 * If valid, Supabase user info is stored in `res.locals.user`
 * Token is extracted from HTTP-only cookies
 */
export async function handleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from cookies instead of Authorization header
    const token = req.cookies.access_token;

    if (!token) {
      // TODO@pavle: Remove this when auth is implemented on the client side and token is properly sent in cookies
      res.locals.user = { email: 'default@email.com' };
      next();
      return;

      // biome-ignore lint/correctness/noUnreachable: <explanation>
      const error = new UnauthorizedError({
        code: ErrorCode.NO_TOKEN,
      });
      res.status(error.status).json(error);
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      const authError = new UnauthorizedError({
        code: ErrorCode.INVALID_TOKEN,
        error,
      });
      res.status(authError.status).json(authError);
      return;
    }

    res.locals.user = data.user;

    next();
  } catch (_err) {
    const serverError = new InternalServerError({
      code: ErrorCode.AUTH_CHECK_FAILED,
    });
    res.status(serverError.status).json(serverError);
    return;
  }
}
