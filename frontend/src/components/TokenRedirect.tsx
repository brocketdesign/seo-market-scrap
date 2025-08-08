import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  affiliateName?: string;
  category?: string;
  hasToken?: boolean;
  message?: string;
}

export default function TokenRedirect({ pageId, onRedirectStart, onRedirectError }: TokenRedirectProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleTokenRedirect = async () => {
      // Get token from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      
      console.log('🔍 TokenRedirect Debug:');
      console.log('- Current URL:', window.location.href);
      console.log('- URL Search Params:', window.location.search);
      console.log('- Extracted token:', token);
      console.log('- Token length:', token?.length);
      console.log('- PageId:', pageId);
      
      if (!token) {
        console.log('❌ No token found in URL parameters');
        return; // No token, nothing to do
      }

      console.log('✅ Token found, starting validation process...');
      setIsProcessing(true);
      setError(null);

      try {
        // First, validate the token
        console.log('🔄 Calling token validation API...');
        console.log('- API URL:', '/api/affiliation/validate-token');
        console.log('- Request payload:', { token });
        
        const tokenValidation = await fetch('/api/affiliation/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        console.log('📡 Token validation response status:', tokenValidation.status);
        console.log('📡 Token validation response headers:', Object.fromEntries(tokenValidation.headers.entries()));

        const tokenResult: TokenValidationResponse = await tokenValidation.json();
        console.log('📋 Token validation result:', tokenResult);

        if (!tokenResult.success) {
          console.log('❌ Token validation failed:', tokenResult.message);
          throw new Error(tokenResult.message || 'Token validation failed');
        }

        console.log('✅ Token validation successful!');

        // If pageId is provided, get the redirect URL
        if (pageId) {
          console.log('🔄 Getting redirect URL for pageId:', pageId);
          const redirectUrl = `/api/affiliation/redirect/${pageId}?token=${encodeURIComponent(token)}`;
          console.log('- Redirect API URL:', redirectUrl);
          
          const redirectResponse = await fetch(redirectUrl);
          console.log('📡 Redirect response status:', redirectResponse.status);
          
          const redirectResult: RedirectResponse = await redirectResponse.json();
          console.log('📋 Redirect result:', redirectResult);

          if (redirectResult.success && redirectResult.redirectUrl) {
            console.log('✅ Redirect URL obtained:', redirectResult.redirectUrl);
            console.log('- Affiliate name:', redirectResult.affiliateName);
            console.log('- Category:', redirectResult.category);
            
            // Clean up URL by removing token parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('t');
            console.log('🧹 Cleaning up URL from:', window.location.href);
            console.log('🧹 Cleaning up URL to:', newUrl.toString());
            window.history.replaceState(null, '', newUrl.toString());

            // Set cookie to prevent multiple redirects
            const cookieName = `tokenRedirect-${pageId}`;
            const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            const cookieValue = `${cookieName}=1; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`;
            console.log('🍪 Setting cookie:', cookieValue);
            document.cookie = cookieValue;

            // Call callback if provided
            console.log('📞 Calling onRedirectStart callback...');
            if (onRedirectStart) {
              onRedirectStart();
            }

            // Redirect to affiliate URL
            // Handle URLs that already have protocol vs those that don't
            const finalUrl = redirectResult.redirectUrl.startsWith('//') 
              ? `https:${redirectResult.redirectUrl}`
              : redirectResult.redirectUrl;
            
            console.log('🚀 Final redirect URL:', finalUrl);
            console.log('🚀 Redirecting in 2 seconds...');
            
            // Add a small delay so we can see the logs
            setTimeout(() => {
              console.log('🚀 REDIRECTING NOW!');
              window.location.href = finalUrl;
            }, 2000);
            
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
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        
        if (onRedirectError) {
          onRedirectError(errorMessage);
        }

        // Clean up URL even on error
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('t');
        window.history.replaceState(null, '', newUrl.toString());
      } finally {
        setIsProcessing(false);
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

  // Don't render anything visible - this is a utility component
  if (isProcessing) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 text-blue-700 px-4 py-2 rounded-md shadow-md z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm">処理中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md shadow-md z-50">
        <div className="flex items-center justify-between space-x-2">
          <span className="text-sm">エラー: {error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 text-lg font-bold leading-none"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
}
