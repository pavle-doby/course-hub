import type { Response } from 'express';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './consts';

export const setAuthTokens = ({
  res,
  accessToken,
  refreshToken,
}: {
  res: Response;
  accessToken: string | undefined;
  refreshToken: string | undefined;
}): boolean => {
  if (!accessToken) {
    return false;
  }

  setAccessToken(res, accessToken);

  if (refreshToken) {
    setRefreshToken(res, refreshToken);
  }

  return true;
};

const setAccessToken = (res: Response, token: string) => {
  res.cookie(ACCESS_TOKEN.name, token, {
    httpOnly: ACCESS_TOKEN.httpOnly,
    secure: ACCESS_TOKEN.secure,
    sameSite: ACCESS_TOKEN.sameSite,
    maxAge: ACCESS_TOKEN.age,
  });
};

const setRefreshToken = (res: Response, token: string) => {
  res.cookie(REFRESH_TOKEN.name, token, {
    httpOnly: REFRESH_TOKEN.httpOnly,
    secure: REFRESH_TOKEN.secure,
    sameSite: REFRESH_TOKEN.sameSite,
    maxAge: REFRESH_TOKEN.age,
  });
};
