export const env = {
  // Next.js only inlines NEXT_PUBLIC_* into the browser bundle; Expo uses EXPO_PUBLIC_*.
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_URL,
};
