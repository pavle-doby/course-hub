import { Montserrat, Geist_Mono } from "next/font/google";

import "@repo/ui-web/globals.css";
import { cn } from "@repo/ui-web/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthTokenProvider } from "@/providers/auth-token-provider";
import { NetworkProvider } from "@/providers/network-provider";
import { PwaProvider } from "@/providers/pwa-provider";
import { ApiClientProvider } from "@repo/api-client";
import { I18nProvider } from "@repo/i18n/client";
import i18nConfig, { getT, getResources, initServerI18next } from "@repo/i18n/server";
import { Toaster } from "@repo/ui-web/components/sonner";
import { TooltipProvider } from "@repo/ui-web";
import type { Metadata, Viewport } from "next";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

initServerI18next(i18nConfig);

export const metadata: Metadata = {
  applicationName: "Course Hub",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-180x180.png",
  },
  appleWebApp: {
    capable: true,
    title: "Course Hub",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#090909",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { i18n, lng } = await getT();

  if (process.env.NODE_ENV === "development") {
    await i18n.reloadResources();
  }

  const resources = getResources(i18n);

  return (
    <I18nProvider language={lng} resources={resources}>
      <html
        lang={lng}
        suppressHydrationWarning
        className={cn("antialiased", fontMono.variable, "font-sans", montserrat.variable)}
      >
        <body>
          <AuthTokenProvider>
            <ApiClientProvider>
              <ThemeProvider>
                <PwaProvider />
                <TooltipProvider>
                  <NetworkProvider>{children}</NetworkProvider>
                </TooltipProvider>
                <Toaster />
              </ThemeProvider>
            </ApiClientProvider>
          </AuthTokenProvider>
        </body>
      </html>
    </I18nProvider>
  );
}
