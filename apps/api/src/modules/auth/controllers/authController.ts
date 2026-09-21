import type { Request, Response } from "express";
import { authService } from "../services/authService";
import {
  AuthLogInUserReq,
  AuthLogInUserRes,
  AuthRefreshTokenReq,
  AuthRefreshTokenRes,
  AuthSignUpUserReq,
  AuthSignUpUserRes,
} from "@repo/contract";

export const authController = {
  signUp: async (_req: Request, res: Response) => {
    const body: AuthSignUpUserReq = res.locals.body;
    const resDto: AuthSignUpUserRes = await authService.signUp({ dto: body });
    return res.status(201).json(resDto);
  },

  logIn: async (_req: Request, res: Response) => {
    const reqDto = {
      email: res.locals.body.email,
      password: res.locals.body.password,
    } as AuthLogInUserReq;
    const resDto: AuthLogInUserRes = await authService.logIn({ dto: reqDto });
    return res.status(200).json(resDto);
  },

  signOut: async (req: Request, res: Response) => {
    await authService.signOut({ req });
    return res.status(200).json();
  },

  refreshToken: async (_req: Request, res: Response) => {
    const body: AuthRefreshTokenReq = res.locals.body;
    const resDto: AuthRefreshTokenRes = await authService.refreshToken({ dto: body });
    return res.status(200).json(resDto);
  },
};
