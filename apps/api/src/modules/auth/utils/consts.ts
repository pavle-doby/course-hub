export const ACCESS_TOKEN = {
  name: 'access_token',
  /**
   * 7 minutes
   */
  age: 7 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  sameSite: 'strict' as const,
};

export const REFRESH_TOKEN = {
  name: 'refresh_token',
  /**
   * 7 days
   */
  age: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  sameSite: 'strict' as const,
};
