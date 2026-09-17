import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, InternalServerError } from "@repo/contract";
import { supabase } from "api/utils/supabase";
import { ErrorCode } from "@repo/contract";

function extractToken(req: Request): string | undefined {
  const tokenHeaderFull = req.headers.authorization;
  return tokenHeaderFull?.startsWith("Bearer ") ? tokenHeaderFull.slice(7) : undefined;
}

/**
 * Checks if Supabase `token` is valid and user is authenticated
 * If valid, Supabase user info is stored in `res.locals.user`
 * Token is extracted from the Authorization header.
 */
export async function handleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);

    if (!token) {
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
