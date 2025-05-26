import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    console.log("Middleware invoked for:", req.nextUrl.pathname);
    console.log("Session token:", req.nextauth.token);

    if (req.nextUrl.pathname.startsWith("/admin") && !req.nextauth.token) {
      console.log("No token, redirecting to login");
      return NextResponse.redirect(
        new URL("/auth/signin?message=You Are Not Authorized!", req.url)
      );
    }
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      console.log("Token present, but role is not admin. Role:", req.nextauth.token?.role);
      return NextResponse.redirect(
        new URL("/auth/signin?message=You Are Not Authorized!", req.url)
      );
    }
    console.log("Token present and role is admin, allowing access.");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This callback is used to determine if the user is authorized.
        // We can log here as well, but the main logic is in the middleware function.
        console.log("withAuth authorized callback, token:", token);
        return !!token; // If there is a token, the user is considered authorized for the middleware function to run
      },
    },
  }
);

export const config = {
    matcher: [
        "/admin/:path*", // Protect all routes under /admin
    ],
};
