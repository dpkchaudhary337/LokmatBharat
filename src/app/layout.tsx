// app/layout.tsx

import { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { cache } from "react";
import { httpClient, safeJsonParse, withSessionToken } from "@/utils/httpClient";

// Components
import TopHeader from "@/components/TopHeader";
import MainMenu from "@/components/MainMenu";
import MobileMenu from "@/components/MobileMenu";
import Footer from "@/components/Footer";
import TopHeaderScrollWrapper from "@/components/TopHeaderScrollWrapper";
import AdAreaWrapper from "@/components/AdAreaWrapper";
import AMPLink from "@/components/AMPLink";
import configData from "@/components/Config";

async function safeGetPayloadJson<T>(
  url: string,
  timeoutMs: number,
  fallback: T
): Promise<T> {
  try {
    const res = await httpClient.get(
      url,
      withSessionToken(configData.SESSION_TOKEN, { timeout: timeoutMs })
    );
    return safeJsonParse<T>(res.data?.payload, fallback);
  } catch {
    return fallback;
  }
}

const getSettings = cache(async function getSettings() {
  const data = await safeGetPayloadJson<any[]>(configData.SETTING_URL, 5_000, []);
  return data[0] || {};
});

const getMenus = cache(async function getMenus() {
  return await safeGetPayloadJson<any[]>(configData.MENU_API_URL, 5_000, []);
});

const getFooterMenus = cache(async function getFooterMenus() {
  return await safeGetPayloadJson<any[]>(
    configData.FOOTER_MENU_API_URL,
    5_000,
    []
  );
});

const getMarqueeNews = cache(async function getMarqueeNews() {
  return await safeGetPayloadJson<any[]>(configData.MARQUEE_API_URL, 5_000, []);
});

const getAdHeader = cache(async function getAdHeader() {
  return await safeGetPayloadJson<any>(
    configData.AD_API_URL + "home-header1",
    5_000,
    {}
  );
});

export async function generateMetadata(): Promise<Metadata> {
  // Check if this is an AMP route - if so, return minimal metadata to avoid duplicates
  let isAMPRoute = false;
  let pathname = "";
  try {
    const headersList = await headers();
    pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
    isAMPRoute = pathname.startsWith("/amp") || pathname === "/amp2";
  } catch (error) {
    isAMPRoute = false;
    pathname = "";
  }

  // For AMP routes, we need to get pathname first to set canonical
  let canonicalPath = "/";
  if (isAMPRoute) {
    try {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || "";
      canonicalPath = pathname.replace("/amp", "") || "/";
    } catch (error) {
      canonicalPath = "/";
    }
    
    // For AMP, return minimal metadata with exact viewport format
    // Next.js will add charset automatically
    // We set viewport with AMP-specific format to prevent Next.js from adding default one
    // Don't set canonical here - it will be set per-page in child generateMetadata functions
    // Setting it here causes duplicates when child pages also set it
    // Don't set metadataBase to prevent Next.js from adding font links or other resources
    // Don't set icons to prevent Next.js from adding preload links
    return {
      title: "Lokmat Bharat - AMP",
      description: "Lokmat Bharat Hindi News",
      viewport: "width=device-width,minimum-scale=1,initial-scale=1",
      // Explicitly set icons to prevent Next.js from adding automatic 16x16 favicon
      // We manually add favicon links in the head section
      icons: {
        icon: [
          { url: "/assets/images/favicon.ico", type: "image/x-icon", sizes: "any" },
        ],
        shortcut: "/assets/images/favicon.ico",
        apple: "/assets/images/favicon.ico",
      },
      // Don't set canonical, alternates, or metadataBase here to prevent duplicates and font links
    } as Metadata;
  }

  const settings = await getSettings();
  // Safely normalize meta keywords coming from backend and replace any old branding
  const rawMetaTags = settings.MetaTags || "Lokmat Bharat";
  const metaTags =
    typeof rawMetaTags === "string"
      ? rawMetaTags.replace(/Navtej TV/gi, "Lokmat Bharat")
      : "Lokmat Bharat";
  const siteUrl = "https://lokmatbharat.com/";

  const faviconUrl = "/assets/images/favicon.ico";
  const socialImageUrl = "https://lokmatbharat.com/assets/images/social.jpg";
  
  // Return minimal metadata - child pages will override with their own generateMetadata
  return {
    metadataBase: new URL("https://lokmatbharat.com"),
    title: {
      default: "Hindi News; Latest Hindi News, Breaking Hindi News Live, Hindi Samachar (हिंदी समाचार), Hindi News Paper Today - Lokmat Bharat",
      template: "%s | Lokmat Bharat",
    },
    description: "Lokmat Bharat Hindi News Samachar - Find all Hindi News and Samachar, News in Hindi, Hindi News Headlines and Daily Breaking Hindi News Today and Updated From lokmatbharat.com",
    keywords: metaTags,
    icons: {
      icon: [
        { url: faviconUrl, sizes: "any" },
        { url: faviconUrl, type: "image/x-icon" },
      ],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    // Set default OG tags - these will be used for home page
    // Child pages with generateMetadata should completely override this
    openGraph: {
      title: "Hindi News; Latest Hindi News, Breaking Hindi News Live, Hindi Samachar (हिंदी समाचार), Hindi News Paper Today - Lokmat Bharat",
      description: "Lokmat Bharat Hindi News Samachar - Find all Hindi News and Samachar, News in Hindi, Hindi News Headlines and Daily Breaking Hindi News Today and Updated From lokmatbharat.com",
      url: siteUrl,
      siteName: "Lokmat Bharat",
      type: "website",
      locale: "hi_IN",
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: "Lokmat Bharat - Hindi News",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Hindi News; Latest Hindi News, Breaking Hindi News Live, Hindi Samachar (हिंदी समाचार), Hindi News Paper Today - Lokmat Bharat",
      description: "Lokmat Bharat Hindi News Samachar - Find all Hindi News and Samachar, News in Hindi, Hindi News Headlines and Daily Breaking Hindi News Today and Updated From lokmatbharat.com",
      images: [socialImageUrl],
    },
    alternates: { canonical: siteUrl },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isAMPRoute = false;
  let pathname = "";
  try {
    const headersList = await headers();
    // Try multiple header names that Next.js might use
    pathname = headersList.get("x-pathname") || 
               headersList.get("x-invoke-path") || 
               headersList.get("x-middleware-pathname") || 
               "";
    isAMPRoute = pathname.startsWith("/amp") || pathname === "/amp2";
    
    // Fallback: check if we can detect from URL
    if (!isAMPRoute && typeof window !== "undefined") {
      // This won't work in server component, but good to have
    }
  } catch (error) {
    // If headers() fails, default to non-AMP
    isAMPRoute = false;
    pathname = "";
  }

  const settingData = await getSettings();
  const menus = await getMenus();
  const footerMenu = await getFooterMenus();
  const marqueeNews = await getMarqueeNews();
  const adHeader = await getAdHeader();

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // For AMP routes, render minimal structure (AMP layout will handle the rest)
  if (isAMPRoute) {
    // Render AMP HTML structure with full control to prevent Next.js interference
    return (
      <html lang="hi" {...({ amp: "", suppressHydrationWarning: true } as any)}>
        <head suppressHydrationWarning>
          {/* BASE tag - removed as it conflicts with Next.js preload links */}
          {/* Next.js will automatically add charset, viewport, and icons from generateMetadata */}
          {/* AMP Runtime Script - Required - Must be first script in head */}
          {/* Must be exactly: <script async src="https://cdn.ampproject.org/v0.js"></script> */}
          <script async src="https://cdn.ampproject.org/v0.js"></script>
          {/* AMP Component Scripts - explicitly prevent crossorigin and other invalid attributes */}
          <script
            async
            src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"
            custom-element="amp-carousel"
          />
          <script
            async
            src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
            custom-element="amp-analytics"
          />
          <script
            async
            src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"
            custom-element="amp-iframe"
          />
          <script
            async
            src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"
            custom-element="amp-social-share"
          />
          <script
            async
            src="https://cdn.ampproject.org/v0/amp-img-0.1.js"
            custom-element="amp-img"
          />
          {/* AMP Boilerplate - Required for AMP validation - Must come after scripts */}
          <style amp-boilerplate="" dangerouslySetInnerHTML={{
            __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`
          }}></style>
          <noscript>
            <style amp-boilerplate="" dangerouslySetInnerHTML={{
              __html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`
            }}></style>
          </noscript>
          {/* Custom Styles - Must use amp-custom */}
          {/* Note: For AMP, fonts should be loaded via @font-face or use system fonts */}
          <style amp-custom="" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #f5f5f5;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 15px;
            }
            .header {
              background: #a10509;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              padding: 8px 0;
              position: sticky;
              top: 0;
              z-index: 100;
            }
            .logo {
              text-align: center;
            }
            .logo amp-img {
              margin: 0 auto;
              width: 100px;
              height: 45px;
            }
            .content {
              background: #fff;
              padding: 25px;
              margin: 20px 0;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .post-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #333;
              line-height: 1.4;
            }
            .post-meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 15px;
            }
            .post-image {
              margin: 20px 0;
              border-radius: 8px;
              overflow: hidden;
            }
            .post-content {
              line-height: 1.8;
              color: #444;
            }
            .post-content p {
              margin-bottom: 15px;
            }
            .share-buttons {
              display: flex;
              gap: 10px;
              margin: 20px 0;
            }
            .footer {
              background: #333;
              color: #fff;
              padding: 30px 0;
              text-align: center;
              margin-top: 40px;
            }
            .news-list {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 25px;
              margin: 20px 0;
            }
            .news-card {
              background: #fff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .news-card amp-img {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: 12px 12px 0 0;
            }
            .news-card-content {
              padding: 20px;
            }
            .news-card-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
              line-height: 1.5;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .news-card-title a {
              color: #333;
              text-decoration: none;
            }
            .news-card-meta {
              color: #666;
              font-size: 12px;
              margin-top: 8px;
            }
            .category-tag {
              display: inline-block;
              padding: 6px 14px;
              background: #007bff;
              color: #fff;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            amp-carousel {
              border-radius: 12px;
              overflow: hidden;
            }
            @media (max-width: 768px) {
              .news-list {
                grid-template-columns: 1fr;
                gap: 15px;
              }
              .content {
                padding: 15px;
              }
            }
            .amp-header {
              background: #a10509;
              padding: 15px 0;
              margin-bottom: 20px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .amp-header-inner {
              text-align: center;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .amp-logo {
              color: #fff;
              margin: 0;
              font-size: 24px;
              text-decoration: none;
              display: inline-block;
            }
            .amp-logo amp-img {
              display: block;
              margin: 0 auto;
            }
            .amp-logo span {
              color: #fff;
              font-weight: bold;
            }
            .amp-title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #333;
            }
            .amp-meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .amp-category {
              margin-left: 10px;
              padding: 4px 12px;
              background: #007bff;
              color: #fff;
              border-radius: 4px;
            }
            .amp-image-wrapper {
              margin: 20px 0;
            }
            .amp-content {
              line-height: 1.8;
              color: #444;
              font-size: 16px;
            }
            .amp-content p {
              margin-bottom: 15px;
            }
            .amp-share-buttons {
              display: flex;
              gap: 10px;
              margin: 30px 0;
            }
            .amp-link-wrapper {
              margin-top: 30px;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 4px;
            }
            .amp-link {
              color: #007bff;
              text-decoration: none;
            }
          ` }} />
         
        </head>
        <body suppressHydrationWarning>
          {/* Simple AMP Header with Logo */}
          <header className="amp-header">
            <div className="container">
              <div className="amp-header-inner">
                <a href="/" className="amp-logo">
                  {settingData?.LogoLiveUrl ? (
                    <amp-img
                      src={settingData.LogoLiveUrl}
                      alt="Lokmat Bharat"
                      width="150"
                      height="60"
                      layout="fixed"
                    />
                  ) : (
                    <span className="amp-logo">Lokmat Bharat</span>
                  )}
                </a>
              </div>
            </div>
          </header>
          {children}
          <amp-analytics type="gtag" data-credentials="include">
        <script
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              vars: {
                gtag_id: "G-1VQLRQN658",
                config: {
                  "G-1VQLRQN658": { groups: "default" },
                },
              },
            }),
          }}
        />
      </amp-analytics>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico" sizes="any" />
        <link rel="shortcut icon" type="image/x-icon" href="/assets/images/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/images/favicon.ico" />
        <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugin.css" />
        <link rel="stylesheet" href="/assets/css/go-masonry.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/pignose.calender.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/custom.css" />
        <link rel="stylesheet" href="/assets/css/responsive.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
        />
      </head>
      <body className="loaded">
        {/* Header */}
        <TopHeader todayDate={todayDate} />
        <MainMenu menus={menus} settingData={settingData} site_lang={3} />
        <MobileMenu menus={menus} settingData={settingData} />

        {/* Top Header Scroll (Marquee) - Visible on all pages */}
        <TopHeaderScrollWrapper marqueeNews={marqueeNews} />

        {/* Ad Area - Visible on all pages */}
        <AdAreaWrapper adHeader={adHeader} />

        {/* AMP Link Component */}
        <AMPLink />

        {/* Page Content */}
        {children}

        {/* Footer */}
        <Footer footerMenu={footerMenu} settingData={settingData} />

        {/* JS */}
        <Script src="https://code.jquery.com/jquery-3.4.1.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/bootstrap.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/popper.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/moment.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/pignose.calender.js" strategy="afterInteractive" />
        <Script src="/assets/js/jquery.unveil.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
        <Script src="/assets/js/custom.js" strategy="afterInteractive" />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/js/all.min.js"
          strategy="afterInteractive"
        />

        {/* Google Tag Manager */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-1VQLRQN658" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1VQLRQN658');
          `}
        </Script>
      </body>
    </html>
  );
}
