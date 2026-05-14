import type { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthLogInUserReq, AuthNativeRefreshTokenReq, AuthSignUpUserReq, User } from '@my/contract';

export const authController = {
  signUp: async (_req: Request, res: Response) => {
    const body: AuthSignUpUserReq = res.locals.body;
    const resDto: User = await authService.signUp({ dto: body, res });
    return res.status(201).json(resDto);
  },

  logIn: async (_req: Request, res: Response) => {
    const reqDto = {
      email: res.locals.body.email,
      password: res.locals.body.password,
    } as AuthLogInUserReq;
    const resDto: User = await authService.logIn({ dto: reqDto, res });
    return res.status(200).json(resDto);
  },

  signOut: async (req: Request, res: Response) => {
    await authService.signOut({ req, res });
    return res.status(200).json();
  },

  refreshToken: async (req: Request, res: Response) => {
    await authService.refreshToken({ req, res });
    return res.status(200).json();
  },

  signUpNative: async (_req: Request, res: Response) => {
    const body: AuthSignUpUserReq = res.locals.body;
    const resDto = await authService.signUpNative({ dto: body });
    return res.status(201).json(resDto);
  },

  logInNative: async (_req: Request, res: Response) => {
    const reqDto = {
      email: res.locals.body.email,
      password: res.locals.body.password,
    } as AuthLogInUserReq;
    const resDto = await authService.logInNative({ dto: reqDto });
    return res.status(200).json(resDto);
  },

  signOutNative: async (req: Request, res: Response) => {
    await authService.signOutNative({ req });
    return res.status(200).json();
  },

  refreshTokenNative: async (_req: Request, res: Response) => {
    const body: AuthNativeRefreshTokenReq = res.locals.body;
    const resDto = await authService.refreshTokenNative({ dto: body });
    return res.status(200).json(resDto);
  },
};
