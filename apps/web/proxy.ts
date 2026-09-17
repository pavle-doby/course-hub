import i18nConfig, { createProxy } from "@repo/i18n/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const i18nProxy = createProxy(i18nConfig);

export function proxy(request: NextRequest): NextResponse {
  return i18nProxy(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|tamagui.css|sw.js|site.webmanifest|manifest.webmanifest|offline.html|icons).*)",
  ],
};
