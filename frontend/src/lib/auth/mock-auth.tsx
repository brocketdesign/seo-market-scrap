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

// Mock session hook to replace useSession from NextAuth
export function useSession(): { data: Session | null; status: string } {
  // For now, return a mock admin session
  // In a real implementation, this would check localStorage or make an API call
  return {
    data: {
      user: {
        id: '1',
        username: 'admin',
        name: 'Admin',
        role: 'admin'
      },
      accessToken: 'mock-token'
    },
    status: 'authenticated'
  };
}

// Mock signIn function
export function signIn(provider?: string, options?: any) {
  console.log('Mock signIn called', { provider, options });
  return Promise.resolve();
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
  return <>{children}</>;
}
