// Static `process.env.X` access so Next (NEXT_PUBLIC_*) and Expo (EXPO_PUBLIC_*) inline the values.
export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_URL,
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
};
