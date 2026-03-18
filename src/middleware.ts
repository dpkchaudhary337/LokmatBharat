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
  
  
  // For AMP routes, we'll modify the response stream to remove Next.js injected resources
  if (pathname.startsWith('/amp') || pathname === '/amp2') {
    // Use a transform stream to modify the HTML response
    let buffer = '';
    
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += new TextDecoder().decode(chunk, { stream: true });
        
        // Process when we have a complete HTML document (wait for </html>)
        if (buffer.includes('</html>')) {
          let html = buffer;
          
          // CRITICAL: Remove ALL Next.js scripts from HEAD first (before AMP scripts)
          // AMP runtime script MUST be the first script in head
          html = html.replace(
            /(<head[^>]*>)([\s\S]*?)(<\/head>)/gi,
            (match, headOpen, headContent, headClose) => {
              // Remove all Next.js scripts from head FIRST (comprehensive cleanup)
              let cleanedHead = headContent;
              
              // Remove scripts with noModule/nomodule attribute (including polyfills)
              cleanedHead = cleanedHead.replace(
                /<script[^>]*noModule[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              cleanedHead = cleanedHead.replace(
                /<script[^>]*nomodule[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Remove polyfills scripts specifically
              cleanedHead = cleanedHead.replace(
                /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Remove all Next.js scripts from head
              cleanedHead = cleanedHead.replace(
                /<script[^>]*src=["'][^"]*\/_next\/[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              cleanedHead = cleanedHead.replace(
                /<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi,
                ''
              );
              cleanedHead = cleanedHead.replace(
                /<script[^>]*>[\s\S]*?self\.__next[\s\S]*?<\/script>/gi,
                ''
              );
              cleanedHead = cleanedHead.replace(
                /<script[^>]*>[\s\S]*?__next[^<]*<\/script>/gi,
                ''
              );
              cleanedHead = cleanedHead.replace(
                /<script[^>]*id=["']_R_["'][^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Remove preload links for scripts
              cleanedHead = cleanedHead.replace(
                /<link[^>]*rel=["']preload["'][^>]*as=["']script["'][^>]*>/gi,
                ''
              );
              
              // Remove any remaining scripts with noModule (safety net)
              cleanedHead = cleanedHead.replace(
                /<script[^>]*\snoModule[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              cleanedHead = cleanedHead.replace(
                /<script[^>]*\snomodule[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Ensure AMP runtime script is the FIRST script
              // Extract AMP runtime script
              const ampRuntimeMatch = cleanedHead.match(/<script[^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*>[\s\S]*?<\/script>/i);
              if (ampRuntimeMatch) {
                // Remove AMP runtime script from its current position
                cleanedHead = cleanedHead.replace(
                  /<script[^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*>[\s\S]*?<\/script>/gi,
                  ''
                );
                
                // Find position after charset and viewport meta tags
                const metaTagsMatch = cleanedHead.match(/(<meta[^>]*charset[^>]*>[\s\S]*?<meta[^>]*viewport[^>]*>)/i);
                if (metaTagsMatch) {
                  // Insert AMP runtime script right after charset/viewport (before any other scripts)
                  cleanedHead = cleanedHead.replace(
                    /(<meta[^>]*viewport[^>]*>)/i,
                    `$1<script async src="https://cdn.ampproject.org/v0.js"></script>`
                  );
                } else {
                  // If no charset/viewport found, insert at the beginning of head content
                  cleanedHead = '<script async src="https://cdn.ampproject.org/v0.js"></script>' + cleanedHead;
                }
                
                // Final cleanup: Remove any remaining scripts with noModule before closing head
                cleanedHead = cleanedHead.replace(
                  /<script[^>]*\s(noModule|nomodule)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
                  ''
                );
                cleanedHead = cleanedHead.replace(
                  /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
                  ''
                );
              } else {
                // Even if no AMP script found, clean head of noModule scripts
                cleanedHead = cleanedHead.replace(
                  /<script[^>]*\s(noModule|nomodule)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
                  ''
                );
                cleanedHead = cleanedHead.replace(
                  /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
                  ''
                );
              }
              
              return headOpen + cleanedHead + headClose;
            }
          );
          
          // Additional pass: Remove any scripts with noModule that might be in head (extra safety)
          html = html.replace(
            /(<head[^>]*>)([\s\S]*?)(<\/head>)/gi,
            (match, headOpen, headContent, headClose) => {
              let finalHead = headContent;
              // Remove any remaining noModule scripts
              finalHead = finalHead.replace(
                /<script[^>]*\s(noModule|nomodule)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              // Remove any remaining stylesheet links from head
              finalHead = finalHead.replace(
                /<link[^>]*rel=["']stylesheet["'][^>]*>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<link[^>]*href=["'][^"]*\.css[^"']*["'][^>]*>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<link[^>]*href=["'][^"]*\/_next\/static\/css\/[^"']*["'][^>]*>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<link[^>]*data-precedence[^>]*>/gi,
                ''
              );
              return headOpen + finalHead + headClose;
            }
          );
          
          // Remove ALL external stylesheet links (AMP doesn't allow external stylesheets)
          // Only inline styles with amp-custom are allowed
          // This must be done before processing body to catch all stylesheets
          
          // Remove stylesheet links (comprehensive pattern)
          html = html.replace(
            /<link[^>]*rel=["']stylesheet["'][^>]*>/gi,
            ''
          );
          
          // Remove link tags with href pointing to CSS files (including Next.js CSS)
          html = html.replace(
            /<link[^>]*href=["'][^"]*\.css[^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove Next.js CSS links specifically (with data-precedence or /_next/static/css/)
          html = html.replace(
            /<link[^>]*href=["'][^"]*\/_next\/static\/css\/[^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove link tags with data-precedence (Next.js CSS injection)
          html = html.replace(
            /<link[^>]*data-precedence[^>]*>/gi,
            ''
          );
          
          // Remove preload links for CSS
          html = html.replace(
            /<link[^>]*rel=["']preload["'][^>]*as=["']style["'][^>]*>/gi,
            ''
          );
          
          // Remove font stylesheet links (fonts.googleapis.com, etc. - not allowed in AMP except specific providers)
          html = html.replace(
            /<link[^>]*href=["'][^"]*fonts\.(googleapis|gstatic)\.com[^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove any link tag that might be a stylesheet (catch-all)
          html = html.replace(
            /<link[^>]*rel=["']stylesheet["'][^>]*href=["'][^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove preload links for scripts
          html = html.replace(
            /<link[^>]*rel=["']preload["'][^>]*as=["']script["'][^>]*>/gi,
            ''
          );
          
          // Remove ALL Next.js JavaScript chunks (more comprehensive pattern)
          html = html.replace(
            /<script[^>]*src=["'][^"]*\/_next\/[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          
          // Remove inline Next.js scripts (hydration, polyfills, etc.) - more patterns
          html = html.replace(
            /<script[^>]*id=["']_R_["'][^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?self\.__next[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?__next[^<]*<\/script>/gi,
            ''
          );
          
          // Remove nomodule scripts (non-AMP scripts with nomodule) - MORE AGGRESSIVE
          html = html.replace(
            /<script[^>]*noModule[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*nomodule[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          
          // Remove polyfills scripts specifically (they often have noModule)
          html = html.replace(
            /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          
          // Remove any script with noModule attribute anywhere (comprehensive)
          html = html.replace(
            /<script[^>]*\snoModule(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*\snomodule(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          
          // CRITICAL: Remove nomodule attribute from AMP scripts (don't remove the script, just the attribute)
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+nomodule(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$2'
          );
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+noModule(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$2'
          );
          
          // Remove any script with fetchPriority (Next.js specific)
          html = html.replace(
            /<script[^>]*fetchPriority[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          
          // CRITICAL: Remove ALL script tags from body (AMP only allows scripts in head)
          // This must be done multiple times to catch all variations
          html = html.replace(
            /(<body[^>]*>)([\s\S]*?)(<\/body>)/gi,
            (match, bodyOpen, bodyContent, bodyClose) => {
              // Remove ALL scripts from body - AMP doesn't allow any scripts in body
              let cleanedBody = bodyContent;
              
              // Multiple aggressive passes to catch all script variations
              // Pass 1: Remove self.__next_f scripts (most common)
              cleanedBody = cleanedBody.replace(
                /<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Pass 2: Remove all script tags with any content
              cleanedBody = cleanedBody.replace(
                /<script[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Pass 3: Remove script tags that might be split or malformed
              cleanedBody = cleanedBody.replace(
                /<script[\s\S]*?<\/script>/gi,
                ''
              );
              
              // Pass 4: Remove any remaining script opening tags (safety net)
              cleanedBody = cleanedBody.replace(
                /<script[^>]*>/gi,
                ''
              );
              
              return bodyOpen + cleanedBody + bodyClose;
            }
          );
          
          // Final pass: Remove any scripts that might be between body tags (safety check)
          // This catches scripts that might have been missed due to regex limitations
          const bodyMatch = html.match(/(<body[^>]*>)([\s\S]*?)(<\/body>)/i);
          if (bodyMatch) {
            const bodyStart = bodyMatch.index!;
            const bodyEnd = bodyStart + bodyMatch[0].length;
            const beforeBody = html.substring(0, bodyStart);
            const bodyContent = bodyMatch[2];
            const afterBody = html.substring(bodyEnd);
            
            // Clean body content one more time (very aggressive)
            let cleanedBodyContent = bodyContent;
            // Remove self.__next_f scripts first
            cleanedBodyContent = cleanedBodyContent.replace(/<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi, '');
            // Remove all script tags
            cleanedBodyContent = cleanedBodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            cleanedBodyContent = cleanedBodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
            cleanedBodyContent = cleanedBodyContent.replace(/<script[^>]*>/gi, '');
            // Remove any script fragments that might remain
            cleanedBodyContent = cleanedBodyContent.replace(/self\.__next_f[^<]*/gi, '');
            
            html = beforeBody + bodyMatch[1] + cleanedBodyContent + bodyMatch[3] + afterBody;
          }
          
          // EXTRA SAFETY: Remove any scripts right before </body> tag
          html = html.replace(
            /([\s\S]*?)(<\/body>)/gi,
            (match, beforeBody, bodyClose) => {
              // Find last </body> and clean everything before it
              const lastBodyIndex = beforeBody.lastIndexOf('</body>');
              if (lastBodyIndex === -1) {
                // No previous </body>, clean the entire beforeBody
                let cleaned = beforeBody.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
                cleaned = cleaned.replace(/self\.__next_f[^<]*/gi, '');
                return cleaned + bodyClose;
              }
              return match;
            }
          );
          
          // CRITICAL: Ensure html tag has amp attribute (mandatory for AMP)
          html = html.replace(
            /<html([^>]*)>/gi,
            (match, attrs) => {
              // Check if amp attribute exists
              if (!attrs.includes('amp') && !attrs.includes('⚡')) {
                // Add amp attribute if not present
                return `<html${attrs} amp="">`;
              }
              // Ensure amp attribute is properly formatted (remove any existing and add clean one)
              let cleanedAttrs = attrs.replace(/\samp(?:=["'][^"']*["'])?/gi, '');
              cleanedAttrs = cleanedAttrs.replace(/\s⚡(?:=["'][^"']*["'])?/gi, '');
              return `<html${cleanedAttrs} amp="">`;
            }
          );
          
          // CRITICAL: Ensure AMP runtime script is the FIRST script in head
          // Move AMP runtime script to be the first script after charset/viewport
          html = html.replace(
            /(<head[^>]*>)([\s\S]*?)(<\/head>)/gi,
            (match, headOpen, headContent, headClose) => {
              // Extract AMP runtime script
              const ampRuntimeMatch = headContent.match(/<script[^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*>[\s\S]*?<\/script>/i);
              if (ampRuntimeMatch) {
                // Remove AMP runtime script from its current position
                let cleanedHead = headContent.replace(
                  /<script[^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*>[\s\S]*?<\/script>/gi,
                  ''
                );
                
                // Find position after charset and viewport meta tags
                const metaTagsMatch = cleanedHead.match(/(<meta[^>]*charset[^>]*>[\s\S]*?<meta[^>]*viewport[^>]*>)/i);
                if (metaTagsMatch) {
                  // Insert AMP runtime script right after charset/viewport
                  cleanedHead = cleanedHead.replace(
                    /(<meta[^>]*viewport[^>]*>)/i,
                    `$1<script async src="https://cdn.ampproject.org/v0.js"></script>`
                  );
                } else {
                  // If no charset/viewport found, insert at the beginning of head content
                  cleanedHead = '<script async src="https://cdn.ampproject.org/v0.js"></script>' + cleanedHead;
                }
                return headOpen + cleanedHead + headClose;
              }
              return match;
            }
          );
          
          // CRITICAL: Fix AMP runtime script - must be exactly: <script async src="https://cdn.ampproject.org/v0.js"></script>
          // Remove any invalid attributes from AMP runtime script (nomodule, crossorigin, etc.)
          html = html.replace(
            /<script([^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*)>/gi,
            () => {
              return '<script async src="https://cdn.ampproject.org/v0.js"></script>';
            }
          );
          
          // Remove nomodule from AMP runtime script specifically (extra safety)
          html = html.replace(
            /<script\s+async\s+src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*>/gi,
            '<script async src="https://cdn.ampproject.org/v0.js"></script>'
          );
          
          // Remove crossorigin from AMP scripts (AMP doesn't allow it)
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+crossorigin=["'][^"']*["']([^>]*>)/gi,
            '$1$2'
          );
          
          // Remove i-amphtml-inserted and data-script attributes from AMP scripts
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+(i-amphtml-inserted|data-script=["'][^"']*["'])([^>]*>)/gi,
            '$1$3'
          );
          
          // Remove suppressHydrationWarning and other React-specific attributes from AMP scripts
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+suppressHydrationWarning(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$2'
          );
          
          // Remove nomodule/noModule from ALL AMP scripts (comprehensive cleanup)
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+(nomodule|noModule)(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$3'
          );
          
          // Remove any other invalid attributes from AMP component scripts (keep only async, src, custom-element)
          html = html.replace(
            /<script([^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\/[^"']*["'][^>]*)>/gi,
            (match, attrs) => {
              // Extract valid attributes
              const hasAsync = attrs.includes('async');
              const srcMatch = attrs.match(/src=["']([^"']+)["']/);
              const customElementMatch = attrs.match(/custom-element=["']([^"']+)["']/);
              
              if (srcMatch && customElementMatch) {
                return `<script async src="${srcMatch[1]}" custom-element="${customElementMatch[1]}"></script>`;
              } else if (srcMatch) {
                return `<script async src="${srcMatch[1]}"></script>`;
              }
              return match;
            }
          );
          
          // Remove invalid attributes from HTML, head, and body tags
          html = html.replace(
            /<html[^>]*\ssuppressHydrationWarning[^>]*>/gi,
            (match) => match.replace(/\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi, '')
          );
          html = html.replace(
            /<head[^>]*\ssuppressHydrationWarning[^>]*>/gi,
            (match) => match.replace(/\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi, '')
          );
          html = html.replace(
            /<body[^>]*\ssuppressHydrationWarning[^>]*>/gi,
            (match) => match.replace(/\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi, '')
          );
          
          // Remove any data-next-* attributes (Next.js specific)
          html = html.replace(
            /\sdata-next-[^=]*=["'][^"']*["']/gi,
            ''
          );
          
          // Remove data-precedence attribute from any tag
          html = html.replace(
            /\sdata-precedence=["'][^"']*["']/gi,
            ''
          );
          
          // Remove id="_R_" from any tag (Next.js React root marker)
          html = html.replace(
            /\sid=["']_R_["']/gi,
            ''
          );
          
          // Remove fetchPriority attribute (not allowed in AMP)
          html = html.replace(
            /\sfetchPriority=["'][^"']*["']/gi,
            ''
          );
          
          // Remove noModule/nomodule attribute from anywhere (not allowed in AMP)
          html = html.replace(
            /\snoModule(?:=["'][^"']*["'])?/gi,
            ''
          );
          html = html.replace(
            /\snomodule(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Remove nomodule from AMP scripts one more time (final cleanup)
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+(nomodule|noModule)(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$3'
          );
          
          // Remove frameborder attribute from all tags (not allowed in AMP)
          html = html.replace(
            /\sframeborder=["'][^"']*["']/gi,
            ''
          );
          html = html.replace(
            /\sframeborder(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Remove scrolling attribute (not allowed in AMP)
          html = html.replace(
            /\sscrolling=["'][^"']*["']/gi,
            ''
          );
          
          // Remove allowfullscreen attribute (not allowed in AMP)
          html = html.replace(
            /\sallowfullscreen(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Remove suppressHydrationWarning from ALL tags (comprehensive cleanup)
          // First pass: Remove from all opening tags
          html = html.replace(
            /<([^>]+)\ssuppressHydrationWarning(?:=["'][^"']*["'])?([^>]*)>/gi,
            '<$1$2>'
          );
          // Second pass: Remove any remaining suppressHydrationWarning attributes
          html = html.replace(
            /\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi,
            ''
          );
          // Third pass: Remove from style tags specifically
          html = html.replace(
            /<style([^>]*)\ssuppressHydrationWarning(?:=["'][^"']*["'])?([^>]*)>/gi,
            '<style$1$2>'
          );
          // Fourth pass: Remove from div and other common tags
          html = html.replace(
            /<(div|span|p|a|header|footer|section|article|main|nav|aside)([^>]*)\ssuppressHydrationWarning(?:=["'][^"']*["'])?([^>]*)>/gi,
            '<$1$2$3>'
          );
          
          // Remove React-specific attributes that might leak through
          html = html.replace(
            /\sdata-reactroot(?:=["'][^"']*["'])?/gi,
            ''
          );
          html = html.replace(
            /\sdata-react-helmet(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Remove invalid attributes from amp-iframe (only allow: width, height, layout, sandbox, src)
          html = html.replace(
            /<amp-iframe([^>]*)>/gi,
            (match, attrs) => {
              // Extract only valid AMP iframe attributes
              const validAttrs: string[] = [];
              const widthMatch = attrs.match(/\swidth=["']([^"']+)["']/i);
              const heightMatch = attrs.match(/\sheight=["']([^"']+)["']/i);
              const layoutMatch = attrs.match(/\slayout=["']([^"']+)["']/i);
              const sandboxMatch = attrs.match(/\ssandbox=["']([^"']+)["']/i);
              const srcMatch = attrs.match(/\ssrc=["']([^"']+)["']/i);
              
              if (widthMatch) validAttrs.push(`width="${widthMatch[1]}"`);
              if (heightMatch) validAttrs.push(`height="${heightMatch[1]}"`);
              if (layoutMatch) validAttrs.push(`layout="${layoutMatch[1]}"`);
              if (sandboxMatch) validAttrs.push(`sandbox="${sandboxMatch[1]}"`);
              if (srcMatch) validAttrs.push(`src="${srcMatch[1]}"`);
              
              return `<amp-iframe ${validAttrs.join(' ')}>`;
            }
          );
          
          // FINAL SAFETY CHECK: One more aggressive pass to remove ALL scripts from body
          // This is the last chance before output
          html = html.replace(
            /(<body[^>]*>)([\s\S]*?)(<\/body>)/gi,
            (match, bodyOpen, bodyContent, bodyClose) => {
              let finalClean = bodyContent;
              // Remove ALL script patterns one final time
              finalClean = finalClean.replace(/<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi, '');
              finalClean = finalClean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
              finalClean = finalClean.replace(/<script[\s\S]*?<\/script>/gi, '');
              finalClean = finalClean.replace(/<script[^>]*>/gi, '');
              // Remove any script content fragments
              finalClean = finalClean.replace(/self\.__next_f[^<]*/gi, '');
              finalClean = finalClean.replace(/self\.__next[^<]*/gi, '');
              return bodyOpen + finalClean + bodyClose;
            }
          );
          
          controller.enqueue(new TextEncoder().encode(html));
          buffer = '';
        }
      },
      flush(controller) {
        // Process any remaining buffer
        if (buffer) {
          let html = buffer;
          
          // Remove all scripts from body (aggressive cleanup)
          html = html.replace(
            /(<body[^>]*>)([\s\S]*?)(<\/body>)/gi,
            (match, bodyOpen, bodyContent, bodyClose) => {
              let cleanedBody = bodyContent;
              
              // Multiple passes for thorough cleanup
              cleanedBody = cleanedBody.replace(/<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi, '');
              cleanedBody = cleanedBody.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
              cleanedBody = cleanedBody.replace(/<script[\s\S]*?<\/script>/gi, '');
              cleanedBody = cleanedBody.replace(/<script[^>]*>/gi, '');
              
              return bodyOpen + cleanedBody + bodyClose;
            }
          );
          
          // Remove Next.js scripts (comprehensive cleanup)
          html = html.replace(
            /<script[^>]*src=["'][^"]*\/_next\/static\/[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?self\.__next[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?__next[^<]*<\/script>/gi,
            ''
          );
          
          // Remove ALL external stylesheets (must be done again in flush)
          html = html.replace(
            /<link[^>]*rel=["']stylesheet["'][^>]*>/gi,
            ''
          );
          html = html.replace(
            /<link[^>]*href=["'][^"]*\.css[^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove Next.js CSS links specifically
          html = html.replace(
            /<link[^>]*href=["'][^"]*\/_next\/static\/css\/[^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove link tags with data-precedence
          html = html.replace(
            /<link[^>]*data-precedence[^>]*>/gi,
            ''
          );
          
          // Remove font stylesheet links
          html = html.replace(
            /<link[^>]*href=["'][^"]*fonts\.(googleapis|gstatic)\.com[^"']*["'][^>]*>/gi,
            ''
          );
          
          // Remove preload links
          html = html.replace(
            /<link[^>]*rel=["']preload["'][^>]*>/gi,
            ''
          );
          
          // Final cleanup: Remove any remaining stylesheet links from head in flush
          html = html.replace(
            /(<head[^>]*>)([\s\S]*?)(<\/head>)/gi,
            (match, headOpen, headContent, headClose) => {
              let finalHead = headContent;
              finalHead = finalHead.replace(
                /<link[^>]*rel=["']stylesheet["'][^>]*>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<link[^>]*href=["'][^"]*\.css[^"']*["'][^>]*>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<link[^>]*href=["'][^"]*\/_next\/static\/css\/[^"']*["'][^>]*>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<link[^>]*data-precedence[^>]*>/gi,
                ''
              );
              return headOpen + finalHead + headClose;
            }
          );
          
          // Remove scripts with noModule/nomodule FIRST (including polyfills)
          html = html.replace(
            /<script[^>]*\s(noModule|nomodule)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          
          // Remove Next.js scripts
          html = html.replace(
            /<script[^>]*src=["'][^"]*\/_next\/[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?self\.__next[\s\S]*?<\/script>/gi,
            ''
          );
          html = html.replace(
            /<script[^>]*>[\s\S]*?__next[^<]*<\/script>/gi,
            ''
          );
          
          // Final cleanup: Remove any remaining noModule scripts from head in flush
          html = html.replace(
            /(<head[^>]*>)([\s\S]*?)(<\/head>)/gi,
            (match, headOpen, headContent, headClose) => {
              let finalHead = headContent;
              finalHead = finalHead.replace(
                /<script[^>]*\s(noModule|nomodule)(?:=["'][^"']*["'])?[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              finalHead = finalHead.replace(
                /<script[^>]*polyfills[^>]*>[\s\S]*?<\/script>/gi,
                ''
              );
              return headOpen + finalHead + headClose;
            }
          );
          
          // Fix AMP runtime script in flush as well
          html = html.replace(
            /<script([^>]*src=["']https:\/\/cdn\.ampproject\.org\/v0\.js["'][^>]*)>/gi,
            () => '<script async src="https://cdn.ampproject.org/v0.js"></script>'
          );
          
          // Remove nomodule from AMP scripts in flush
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+(nomodule|noModule)(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$3'
          );
          
          // Remove invalid attributes
          html = html.replace(
            /<html[^>]*\ssuppressHydrationWarning[^>]*>/gi,
            (match) => match.replace(/\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi, '')
          );
          html = html.replace(
            /<head[^>]*\ssuppressHydrationWarning[^>]*>/gi,
            (match) => match.replace(/\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi, '')
          );
          html = html.replace(
            /<body[^>]*\ssuppressHydrationWarning[^>]*>/gi,
            (match) => match.replace(/\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi, '')
          );
          
          // Remove frameborder, scrolling, allowfullscreen in flush as well
          html = html.replace(
            /\sframeborder=["'][^"']*["']/gi,
            ''
          );
          html = html.replace(
            /\sframeborder(?:=["'][^"']*["'])?/gi,
            ''
          );
          html = html.replace(
            /\sscrolling=["'][^"']*["']/gi,
            ''
          );
          html = html.replace(
            /\sallowfullscreen(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Remove suppressHydrationWarning from ALL tags in flush
          html = html.replace(
            /\ssuppressHydrationWarning(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Clean amp-iframe in flush
          html = html.replace(
            /<amp-iframe([^>]*)>/gi,
            (match, attrs) => {
              const validAttrs: string[] = [];
              const widthMatch = attrs.match(/\swidth=["']([^"']+)["']/i);
              const heightMatch = attrs.match(/\sheight=["']([^"']+)["']/i);
              const layoutMatch = attrs.match(/\slayout=["']([^"']+)["']/i);
              const sandboxMatch = attrs.match(/\ssandbox=["']([^"']+)["']/i);
              const srcMatch = attrs.match(/\ssrc=["']([^"']+)["']/i);
              
              if (widthMatch) validAttrs.push(`width="${widthMatch[1]}"`);
              if (heightMatch) validAttrs.push(`height="${heightMatch[1]}"`);
              if (layoutMatch) validAttrs.push(`layout="${layoutMatch[1]}"`);
              if (sandboxMatch) validAttrs.push(`sandbox="${sandboxMatch[1]}"`);
              if (srcMatch) validAttrs.push(`src="${srcMatch[1]}"`);
              
              return `<amp-iframe ${validAttrs.join(' ')}>`;
            }
          );
          
          // Remove other invalid attributes
          html = html.replace(
            /\sdata-precedence=["'][^"']*["']/gi,
            ''
          );
          html = html.replace(
            /\sid=["']_R_["']/gi,
            ''
          );
          html = html.replace(
            /\sfetchPriority=["'][^"']*["']/gi,
            ''
          );
          html = html.replace(
            /\snoModule(?:=["'][^"']*["'])?/gi,
            ''
          );
          html = html.replace(
            /\snomodule(?:=["'][^"']*["'])?/gi,
            ''
          );
          
          // Remove invalid attributes from AMP scripts (including nomodule)
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+(crossorigin|suppressHydrationWarning|i-amphtml-inserted|data-script|nomodule|noModule)=["'][^"']*["']([^>]*>)/gi,
            '$1$3'
          );
          html = html.replace(
            /(<script[^>]*src=["']https:\/\/cdn\.ampproject\.org[^"']*["'][^>]*)\s+(nomodule|noModule)(?:=["'][^"']*["'])?([^>]*>)/gi,
            '$1$3'
          );
          
          controller.enqueue(new TextEncoder().encode(html));
        }
      },
    });
    
    return new NextResponse(transformStream.readable, {
      headers: response.headers,
    });
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

