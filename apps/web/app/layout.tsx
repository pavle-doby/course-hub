import { Montserrat, Geist_Mono } from "next/font/google";

import "@repo/ui-web/globals.css";
import { cn } from "@repo/ui-web/lib/utils";
import { ThemeProvider } from "@/providers/theme-provider";
import { ApiClientProvider } from "@repo/api-client";
import { I18nProvider } from "@repo/i18n/client";
import i18nConfig, { getT, getResources, initServerI18next } from "@repo/i18n/server";
import { Toaster } from "@repo/ui-web/components/sonner";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

initServerI18next(i18nConfig);

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
          <ApiClientProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </ApiClientProvider>
        </body>
      </html>
    </I18nProvider>
  );
}
