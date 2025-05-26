import { NextRequest, NextResponse } from 'next/server';

/**
 * Image proxy route to bypass CORS and domain restrictions
 * This allows loading images from external domains that aren't in the Next.js image config
 */
export async function GET(request: NextRequest) {
  try {
    // Get the image URL from the query parameters
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Process Amazon URLs - try to convert to high resolution if needed
    let processedUrl = url;
    
    if (url.includes('amazon.com') || url.includes('images-amazon')) {
      // Handle various Amazon image URL patterns to ensure we get high quality images
      processedUrl = url
        // Replace size indicators with high-res version
        .replace(/_S[CX]_/, '_AC_SL1500_')
        .replace(/_SR\d+,\d+/, '_SL1500_')
        .replace(/_SY\d+_SX\d+/, '_SL1500_')
        .replace(/\._(S|SR|SY|SX|UY|UX|CR|AC|AA)\d+_\./, '._SL1500_.')
        // Handle other common patterns
        .replace(/\._(CB\d+)_\./, '._SL1500_.')
        // Make sure we're getting a jpg/png when possible
        .replace(/\.(gif|webp)([?#].+)?$/, '.jpg$2');
    }
    
    // Set up request headers to mimic a normal browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': new URL(processedUrl).origin, // Set referer to the image source domain to avoid anti-hotlinking
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    };
    
    // Fetch the image from the original source
    const response = await fetch(processedUrl, { headers });

    if (!response.ok) {
      console.error(`Image fetch failed: ${response.status} ${response.statusText} for URL ${processedUrl}`);
      
      // If we modified the URL and it failed, try the original URL
      if (processedUrl !== url) {
        console.log(`Retrying with original URL: ${url}`);
        const originalResponse = await fetch(url, { headers });
        
        if (!originalResponse.ok) {
          return new NextResponse(`Failed to fetch image: ${originalResponse.statusText}`, { 
            status: originalResponse.status 
          });
        }
        
        const imageBuffer = await originalResponse.arrayBuffer();
        const contentType = originalResponse.headers.get('content-type') || 'image/jpeg';
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for one day
          },
        });
      }
      
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { 
        status: response.status 
      });
    }

    // Get the image data as arrayBuffer
    const imageBuffer = await response.arrayBuffer();
    
    // Get the content type to properly set in the response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for one day
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new NextResponse(`Error fetching image: ${error.message}`, { 
      status: 500 
    });
  }
}
