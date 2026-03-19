// app/layout.tsx

import { Metadata } from "next";
import Script from "next/script";
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
