import { useEffect } from 'react';

interface TokenRedirectProps {
  pageId?: number;
  onRedirectStart?: () => void;
  onRedirectError?: (error: string) => void;
}

interface TokenValidationResponse {
  success: boolean;
  message?: string;
  origin?: string;
}

interface RedirectResponse {
  success: boolean;
  pageId?: number;
  redirectUrl?: string;
  hasToken?: boolean;
  message?: string;
}

export default function TokenRedirect({ pageId, onRedirectStart, onRedirectError }: TokenRedirectProps) {
  useEffect(() => {
    const handleTokenRedirect = async () => {
      // Get token from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      
      if (!token) {
        return; // No token, nothing to do
      }

      try {
        // First, validate the token
        const tokenValidation = await fetch('/api/affiliation/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const tokenResult: TokenValidationResponse = await tokenValidation.json();

        if (!tokenResult.success) {
          throw new Error(tokenResult.message || 'Token validation failed');
        }

        // If pageId is provided, get the redirect URL
        if (pageId) {
          const redirectResponse = await fetch(`/api/affiliation/redirect/${pageId}?token=${encodeURIComponent(token)}`);
          const redirectResult: RedirectResponse = await redirectResponse.json();

          if (redirectResult.success && redirectResult.redirectUrl) {
            // Clean up URL by removing token parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('t');
            window.history.replaceState(null, '', newUrl.toString());

            // Set cookie to prevent multiple redirects
            const cookieName = `tokenRedirect-${pageId}`;
            const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            document.cookie = `${cookieName}=1; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`;

            // Call callback if provided
            if (onRedirectStart) {
              onRedirectStart();
            }

            // Redirect to affiliate URL
            // Handle URLs that already have protocol vs those that don't
            const finalUrl = redirectResult.redirectUrl.startsWith('//') 
              ? `https:${redirectResult.redirectUrl}`
              : redirectResult.redirectUrl;
            
            window.location.href = finalUrl;
            return;
          } else {
            throw new Error(redirectResult.message || 'No redirect URL found');
          }
        } else {
          // Token is valid but no pageId provided
          // Just clean up the URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('t');
          window.history.replaceState(null, '', newUrl.toString());
        }

      } catch (err) {
        // Silent error handling - no user feedback
        if (onRedirectError) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          onRedirectError(errorMessage);
        }

        // Clean up URL even on error
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('t');
        window.history.replaceState(null, '', newUrl.toString());
      }
    };

    // Check if we've already processed this page recently
    if (pageId) {
      const cookieName = `tokenRedirect-${pageId}`;
      const hasRecentRedirect = document.cookie
        .split(';')
        .some(cookie => cookie.trim().startsWith(`${cookieName}=`));
      
      if (hasRecentRedirect) {
        return; // Skip if we've already redirected recently
      }
    }

    handleTokenRedirect();
  }, [pageId, onRedirectStart, onRedirectError]);

  // This component is completely invisible to the user
  return null;
}
