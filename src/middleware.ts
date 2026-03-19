import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // HTTPS Redirect - Force HTTPS with 301 (Permanent Redirect)
  // Check multiple headers for HTTPS detection (works with various hosting providers)
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedSsl = request.headers.get('x-forwarded-ssl');
  const isHttps =
    forwardedProto === 'https' ||
    forwardedSsl === 'on' ||
    url.protocol === 'https:';

  // Only redirect in production (not in development)
  // Redirect HTTP to HTTPS with 301 (Permanent Redirect)
  if (
    process.env.NODE_ENV === 'production' &&
    !isHttps &&
    !url.hostname.includes('localhost') &&
    !url.hostname.includes('127.0.0.1') &&
    !url.hostname.includes('0.0.0.0')
  ) {
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }

  // Set a custom header with the pathname for use in layouts
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  // Also set as x-invoke-path for better Next.js compatibility
  response.headers.set('x-invoke-path', pathname);

  // HSTS (HTTP Strict Transport Security) - Force HTTPS for 1 year
  // Only set in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Additional Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CDN Caching Headers Configuration
  // Static assets - long cache (1 year) with immutable
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.match(/\.(js|css|woff|woff2|ttf|eot|otf|svg|png|jpg|jpeg|gif|webp|ico|avif)$/i)
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable, stale-while-revalidate=86400'
    );
    response.headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vary', 'Accept-Encoding');
  }
  // Public assets (images, fonts, etc.)
  else if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=2592000, stale-while-revalidate=604800'
    );
    response.headers.set('CDN-Cache-Control', 'public, max-age=2592000');
    response.headers.set('Vary', 'Accept-Encoding');
  }
  // HTML pages - shorter cache with revalidation
  else if (
    pathname.endsWith('.html') ||
    (!pathname.includes('.') && !pathname.startsWith('/api') && !pathname.startsWith('/_next'))
  ) {
    // For HTML pages, use stale-while-revalidate for better performance
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400, must-revalidate'
    );
    response.headers.set('CDN-Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    response.headers.set('Vary', 'Accept, Accept-Encoding');
  }
  // API routes - no cache or very short cache
  else if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
  }
  // Default for other routes
  else {
    response.headers.set(
      'Cache-Control',
      'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600'
    );
    response.headers.set('CDN-Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
