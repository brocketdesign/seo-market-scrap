import { getSession } from '@/lib/auth/mock-auth';

export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch with authentication
 * Automatically adds the authorization header if the user is logged in
 */
export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  // Create headers object if it doesn't exist
  const headers = new Headers(fetchOptions.headers || {});
  
  if (!skipAuth) {
    try {
      // Get the session from mock auth
      const session = await getSession();
      
      // Add the authorization header if we have a token
      if (session?.accessToken) {
        headers.set('Authorization', `Bearer ${session.accessToken}`);
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
  }
  
  // Return the fetch with the updated headers
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
}
