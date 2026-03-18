"use client";

import { useEffect, useState } from "react";
import TopHeaderScroll from "./TopHeaderScroll";

interface TopHeaderScrollWrapperProps {
  marqueeNews?: any[];
}

export default function TopHeaderScrollWrapper({ marqueeNews }: TopHeaderScrollWrapperProps) {
  const [siteLang, setSiteLang] = useState<number | string>(3);

  useEffect(() => {
    // Get site_lang from localStorage on client side
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("site_lang");
      setSiteLang(storedLang ? (typeof storedLang === 'string' ? parseInt(storedLang) : storedLang) : 3);
    }
  }, []);

  return <TopHeaderScroll marqueeNews={marqueeNews} site_lang={siteLang} />;
}

