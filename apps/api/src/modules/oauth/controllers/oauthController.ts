import type { Request, Response } from "express";
import type { OauthApproveReq, OauthApproveRes } from "@repo/contract";
import { OauthError, oauthService } from "../services/oauthService";

function sendOauthError(res: Response, error: unknown): void {
  if (!(error instanceof OauthError)) {
    throw error;
  }
  const body = { error: error.error, error_description: error.description };
  res.status(error.status).json(body);
}

export const oauthController = {
  getProtectedResourceMetadata: (_req: Request, res: Response): void => {
    const metadata = oauthService.getProtectedResourceMetadata();
    res.status(200).json(metadata);
  },

  getAuthorizationServerMetadata: (_req: Request, res: Response): void => {
    const metadata = oauthService.getAuthorizationServerMetadata();
    res.status(200).json(metadata);
  },

  // OAuth endpoints parse their own input: clients expect RFC 6749 errors, not `validate()` ones
  registerClient: (req: Request, res: Response): void => {
    try {
      const client = oauthService.registerClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      sendOauthError(res, error);
    }
  },

  authorize: (req: Request, res: Response): void => {
    try {
      const consentUrl = oauthService.getConsentUrl(req.query);
      res.redirect(302, consentUrl);
    } catch (error) {
      sendOauthError(res, error);
    }
  },

  token: async (req: Request, res: Response): Promise<void> => {
    try {
      const tokens = await oauthService.exchangeCode(req.body);
      res.status(200).set("Cache-Control", "no-store").json(tokens);
    } catch (error) {
      sendOauthError(res, error);
    }
  },

  approve: (_req: Request, res: Response): void => {
    const authUserId: string = res.locals.user.id;
    const reqDto = res.locals.body as OauthApproveReq;
    const resDto: OauthApproveRes = oauthService.approve(authUserId, reqDto);
    res.status(200).json(resDto);
  },
};
