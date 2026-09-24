import type { Request, Response, NextFunction } from "express";
import { ErrorCode, ErrorCodeAi, UnauthorizedError } from "@repo/contract";
import { apiTokensService } from "api/modules/api-tokens/services/apiTokensService";
import { oauthService } from "api/modules/oauth/services/oauthService";

/**
 * Checks a personal access token (`Authorization: Bearer ch_pat_…`).
 * If valid, `res.locals.userId` / `res.locals.authUserId` identify the token owner.
 * Only mounted on the MCP route, so PATs can't call the REST API.
 * On 401, `WWW-Authenticate` points OAuth-capable clients (claude.ai) to the login metadata.
 */
export async function handleTokenAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    const error = new UnauthorizedError({ code: ErrorCode.NO_TOKEN });
    res
      .status(error.status)
      .set("WWW-Authenticate", `Bearer resource_metadata="${oauthService.resourceMetadataUrl()}"`)
      .json(error);
    return;
  }

  const owner = await apiTokensService.authenticate(token);
  if (!owner) {
    const error = new UnauthorizedError({ code: ErrorCodeAi.INVALID_TOKEN });
    res
      .status(error.status)
      .set("WWW-Authenticate", `Bearer resource_metadata="${oauthService.resourceMetadataUrl()}"`)
      .json(error);
    return;
  }

  res.locals.userId = owner.userId;
  res.locals.authUserId = owner.authUserId;
  next();
}
