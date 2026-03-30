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
  params: Promise<{ categorySlug: string }> 
}) {
  const { categorySlug } = use(params);
  const searchParams = useSearchParams();
  const searchText = searchParams?.get("search") || null;

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

    fetchData();
  }, [categorySlug]);

  // Set dynamic metadata
  const categoryName = categoryData?.CategoryName || categorySlug.replace(/-/g, " ");
  const categoryUrl = `https://lokmatbharat.com/category/${categorySlug}`;
  
  useMetadata({
    title: `${categoryName} | Lokmat Bharat`,
    description: `Latest ${categoryName} news and updates on Lokmat Bharat`,
    keywords: categoryName,
    url: categoryUrl,
  });

  return (
    <>
      <head>
        <link rel="amphtml" href={`https://lokmatbharat.com/amp/category/${categorySlug}`} />
      </head>
      <div>
        {!searchText && (
          <HeroAreaCategory 
            adRight3={adRight3}
            categorySlug={categorySlug}
          />
        )}
        {searchText && (
          <SearchList 
            searchText={searchText}
            categorySlug={categorySlug}
          />
        )}
      </div>
    </>
  );
}

