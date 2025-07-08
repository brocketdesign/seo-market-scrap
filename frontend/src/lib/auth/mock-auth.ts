import React from 'react';

// Simple mock authentication to replace NextAuth temporarily
export interface Session {
  user?: {
    id: string;
    username: string;
    name?: string;
    role: string;
  };
  accessToken?: string;
}

/**
 * Get token from cookie
 */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Mock session hook to replace useSession from NextAuth
export function useSession(): { data: Session | null; status: string } {
  // Check for real token in cookie first
  const token = getTokenFromCookie();
  
  if (token) {
    // If we have a real token, return a session with it
    return {
      data: {
        user: {
          id: '1',
          username: 'admin',
          name: 'Admin',
          role: 'admin'
        },
        accessToken: token
      },
      status: 'authenticated'
    };
  }
  
  // For now, return a mock admin session if no real token
  // In a real implementation, this would check localStorage or make an API call
  return {
    data: null,
    status: 'unauthenticated'
  };
}

// Mock signIn function
export function signIn(provider?: string, options?: any) {
  console.log('Mock signIn called', { provider, options });
  return Promise.resolve({ ok: true, error: null });
}

// Mock getCsrfToken function
export function getCsrfToken() {
  return Promise.resolve('mock-csrf-token');
}

// Mock getSession function for fetchWithAuth
export function getSession() {
  return Promise.resolve({
    user: {
      id: '1',
      username: 'admin',
      name: 'Admin',
      role: 'admin'
    },
    accessToken: 'mock-token'
  });
}

// Mock SessionProvider component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}
