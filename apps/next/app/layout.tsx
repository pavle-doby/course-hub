import type { Metadata } from 'next';
import { NextTamaguiProvider } from 'app/provider/NextTamaguiProvider';
import { ApiClientProvider } from '@my/api-client';

export const metadata: Metadata = {
  title: 'Course Hub',
  description: 'Place where the best courses live.',
  icons: '/favicon.ico',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ApiClientProvider>
          <NextTamaguiProvider>{children}</NextTamaguiProvider>
        </ApiClientProvider>
      </body>
    </html>
  );
}
