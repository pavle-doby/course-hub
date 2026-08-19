import i18nConfig, { createProxy } from "@repo/i18n/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const i18nProxy = createProxy(i18nConfig);

export function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get("access_token");
  const isAuthRoute = request.nextUrl.pathname.includes("/auth");

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return i18nProxy(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|tamagui.css|sw.js|site.webmanifest).*)",
  ],
};
