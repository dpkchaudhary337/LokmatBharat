import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  // AMP support in Next.js 15
  amp: {
    canonicalBase: 'https://lokmatbharat.com',
  },
  // Disable script optimization for AMP pages to prevent modification
  experimental: {
    optimizePackageImports: [],
  },
  // CDN Caching Headers for static assets
  async headers() {
    return [
      {
        // Cache static assets (JS, CSS, fonts, images) for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache public assets (images, fonts, etc.)
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=604800',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=2592000',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache image files
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|svg|ico|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=604800',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=2592000',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache font files
        source: '/:path*\\.(woff|woff2|ttf|eot|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Cache CSS and JS files
        source: '/:path*\\.(css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Security headers for all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
  // Redirects configuration - all redirects are permanent (301)
  async redirects() {
    return [
      // Add any custom redirects here with status: 301
      // Example:
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true, // This creates a 301 redirect
      // },
    ];
  },
};

export default nextConfig;
