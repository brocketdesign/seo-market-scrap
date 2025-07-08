
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['en', 'ja'] as const;
const defaultLocale = 'ja'; // Changed default to Japanese

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Handle locale redirection for public pages
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect to Japanese version if no locale is specified and it's a public page
  if (pathnameIsMissingLocale && !pathname.startsWith('/admin') && !pathname.startsWith('/auth')) {
    // Redirect root to /ja
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/ja', request.url));
    }
    
    // Redirect other paths to /ja/path
    return NextResponse.redirect(new URL(`/ja${pathname}`, request.url));
  }

  // Check for auth token in cookies for admin routes
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth/signin");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  // If no token and trying to access admin page, redirect to signin
  if (!token && isAdminPage && !isAuthPage) {
    const signinUrl = request.nextUrl.clone();
    signinUrl.pathname = "/auth/signin";
    return NextResponse.redirect(signinUrl);
  }

  // Otherwise, allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
