import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, just allow all requests to pass through
  // Admin authentication will be handled by the backend API
  console.log("Middleware invoked for:", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // Apply middleware to admin routes
  ],
};
