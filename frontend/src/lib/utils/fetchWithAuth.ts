export interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
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
      // Get the token from cookie
      const token = getTokenFromCookie();
      
      // Add the authorization header if we have a token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
  }
  
  // Return the fetch with the updated headers
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
}
