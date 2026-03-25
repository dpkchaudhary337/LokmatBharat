"use client";

import { useEffect } from "react";

interface MetadataProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export function useMetadata({
  title,
  description,
  keywords,
  image,
  url,
}: MetadataProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !document) return;
    
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute("content", description);
    }

    // Update or create meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // Update OpenGraph tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    if (title) updateMetaTag("og:title", title);
    if (description) updateMetaTag("og:description", description);
    if (url) updateMetaTag("og:url", url);
    
    // Ensure image URL is absolute
    if (image) {
      let imageUrl = image;
      // If image is relative, make it absolute
      if (!imageUrl.startsWith("http")) {
        if (imageUrl.startsWith("//")) {
          imageUrl = `https:${imageUrl}`;
        } else if (imageUrl.startsWith("/")) {
          imageUrl = `https://lokmat-next-base.vercel.app${imageUrl}`;
        } else {
          // Assume it's from storage.googleapis.com
          imageUrl = `https://storage.googleapis.com${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
        }
      }
      updateMetaTag("og:image", imageUrl);
      updateMetaTag("og:image:url", imageUrl);
      updateMetaTag("og:image:secure_url", imageUrl);
      updateMetaTag("og:image:type", "image/jpeg");
      updateMetaTag("og:image:width", "1200");
      updateMetaTag("og:image:height", "630");
    } else {
      // Fallback to default social image
      const defaultImage = "https://lokmat-next-base.vercel.app/assets/images/social.jpg";
      updateMetaTag("og:image", defaultImage);
      updateMetaTag("og:image:url", defaultImage);
    }
    
    // Set og:type based on URL - if it's a details page, use "article"
    const isArticle = url && url.includes("/details/");
    updateMetaTag("og:type", isArticle ? "article" : "website");
    updateMetaTag("og:site_name", "Lokmat Bharat");
    updateMetaTag("og:locale", "hi_IN");

    // Update Twitter Card tags
    if (title) {
      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement("meta");
        twitterTitle.setAttribute("name", "twitter:title");
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute("content", title);
    }

    if (description) {
      let twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDesc) {
        twitterDesc = document.createElement("meta");
        twitterDesc.setAttribute("name", "twitter:description");
        document.head.appendChild(twitterDesc);
      }
      twitterDesc.setAttribute("content", description);
    }

    // Twitter Card - use large image card for better sharing
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement("meta");
      twitterCard.setAttribute("name", "twitter:card");
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute("content", "summary_large_image");
    
    // Twitter Site
    let twitterSite = document.querySelector('meta[name="twitter:site"]');
    if (!twitterSite) {
      twitterSite = document.createElement("meta");
      twitterSite.setAttribute("name", "twitter:site");
      document.head.appendChild(twitterSite);
    }
    twitterSite.setAttribute("content", "@navtejtv");
    
    if (image) {
      // Ensure image URL is absolute for Twitter
      let imageUrl = image;
      if (!imageUrl.startsWith("http")) {
        if (imageUrl.startsWith("//")) {
          imageUrl = `https:${imageUrl}`;
        } else if (imageUrl.startsWith("/")) {
          imageUrl = `https://lokmat-next-base.vercel.app${imageUrl}`;
        } else {
          imageUrl = `https://storage.googleapis.com${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
        }
      }
      
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement("meta");
        twitterImage.setAttribute("name", "twitter:image");
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute("content", imageUrl);
    } else {
      // Fallback image for Twitter
      const defaultImage = "https://lokmat-next-base.vercel.app/assets/images/social.jpg";
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement("meta");
        twitterImage.setAttribute("name", "twitter:image");
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute("content", defaultImage);
    }

    // Update canonical URL
    if (url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
    }
  }, [title, description, keywords, image, url]);
}

