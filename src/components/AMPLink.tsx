"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AMPLink() {
  const pathname = usePathname();
  const siteUrl = "https://lokmatbharat.com";

  useEffect(() => {
    // Don't add AMP link on AMP pages themselves
    if (pathname?.startsWith("/amp")) {
      return;
    }

    // Create and add AMP link tag
    const link = document.createElement("link");
    link.rel = "amphtml";
    
    // Map regular paths to AMP paths
    if (pathname?.startsWith("/details/")) {
      link.href = `${siteUrl}/amp${pathname}`;
    } else if (pathname?.startsWith("/category/")) {
      link.href = `${siteUrl}/amp${pathname}`;
    } else if (pathname === "/") {
      link.href = `${siteUrl}/amp`;
    } else {
      return; // Don't add AMP link for other pages
    }

    document.head.appendChild(link);

    return () => {
      // Cleanup on unmount
      const existingLink = document.querySelector('link[rel="amphtml"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, [pathname]);

  return null;
}

