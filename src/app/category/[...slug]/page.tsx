"use client";

import React, { useEffect, useState, use } from "react";
import Axios from "axios";
import configData from "@/components/Config";
import HeroAreaCategory from "@/components/HeroAreaCategory";
import SearchList from "@/components/SearchList";
import { useSearchParams } from "next/navigation";
import { useMetadata } from "@/utils/useMetadata";

export default function CategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string[] }> 
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const searchText = searchParams?.get("search") || null;

  // Extract categorySlug and page number from slug array
  // slug[0] = categorySlug, slug[1] = page number (if exists)
  const categorySlug = slug?.[0] || "";
  const pageNumber = slug?.[1] && !isNaN(Number(slug[1])) ? Number(slug[1]) : 1;

  const [adRight3, setAdRight3] = useState<any>();
  const [categoryData, setCategoryData] = useState<any>(null);

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adRight3Res, categoryRes] = await Promise.all([
          Axios.get(configData.AD_API_URL + "home-right3", axiosConfig),
          Axios.get(configData.POST_API_URL.replace("#CATEGORY_SLUG", categorySlug).replace("#OFFSET", "0"), axiosConfig),
        ]);
        setAdRight3(JSON.parse(adRight3Res.data.payload));
        const categoryDataParsed = JSON.parse(categoryRes.data.payload);
        setCategoryData(Array.isArray(categoryDataParsed) ? categoryDataParsed[0] : categoryDataParsed);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    if (categorySlug) {
      fetchData();
    }
  }, [categorySlug]);

  // Set dynamic metadata
  const categoryName = categoryData?.CategoryName || categorySlug.replace(/-/g, " ");
  const categoryUrl = `https://lokmatbharat.com/category/${categorySlug}${pageNumber > 1 ? `/${pageNumber}` : ""}`;
  
  useMetadata({
    title: `${categoryName} | Lokmat Bharat`,
    description: `Latest ${categoryName} news and updates on Lokmat Bharat`,
    keywords: categoryName,
    url: categoryUrl,
  });

  return (
    <div>
      {!searchText && (
        <HeroAreaCategory 
          adRight3={adRight3}
          categorySlug={categorySlug}
          pageNumber={pageNumber}
        />
      )}
      {searchText && (
        <SearchList 
          searchText={searchText}
          categorySlug={categorySlug}
        />
      )}
    </div>
  );
}

