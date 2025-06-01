import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Make sure this path is correct if your types file is elsewhere
// The import of Session and JWT from next-auth/jwt might not be needed here if already declared globally
// import '../../types/next-auth.d.ts'; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          console.log('[NextAuth Authorize] Missing username or password');
          return null;
        }
        console.log('[NextAuth Authorize] Attempting to authorize user:', credentials.username);

        try {
          // Use NEXT_PUBLIC_API_URL for consistency, fallback to localhost:8000
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
          console.log('[NextAuth Authorize] Calling backend API:', `${apiBaseUrl}/api/admin/login`);
          
          const res = await fetch(`${apiBaseUrl}/api/admin/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          console.log('[NextAuth Authorize] Backend response status:', res.status);
          const responseBody = await res.text(); // Get response body as text to log it
          console.log('[NextAuth Authorize] Backend response body:', responseBody);

          if (!res.ok) {
            console.error('[NextAuth Authorize] Backend login failed. Status:', res.status, 'Body:', responseBody);
            return null;
          }

          const data = JSON.parse(responseBody); // Parse JSON after logging

          if (data.token && data.user) {
            console.log('[NextAuth Authorize] Backend login successful for user:', data.user.username);
            return {
              id: data.user.id,
              name: data.user.username,
              username: data.user.username,
              role: data.user.role,
              accessToken: data.token,
            } as NextAuthUser;
          } else {
            console.log('[NextAuth Authorize] Backend response missing token or user data.');
            return null;
          }
        } catch (error) {
          console.error("[NextAuth Authorize] Error during backend authentication:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // The \'user\' object is passed on the first call to JWT after signin
      // Subsequent calls will only have \'token\'.
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Use \'as any\' or ensure user is correctly typed based on your User interface
        token.username = (user as any).username;
        token.accessToken = (user as any).accessToken; // Persist accessToken to the JWT
      }
      return token;
    },
    async session({ session, token }) {
      // Assign properties from token to session.user
      // These properties must be defined in your extended Session interface in next-auth.d.ts
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        // session.user.name = token.name as string; // if you have name
      }
      session.accessToken = token.accessToken as string; // Make accessToken available in the session object
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
