"use client";

import React, { Suspense } from "react";
import SearchList from "@/components/SearchList";
import { useSearchParams } from "next/navigation";
import { useMetadata } from "@/utils/useMetadata";

function SearchContent() {
  const searchParams = useSearchParams();
  const searchText = searchParams?.get("search") || null;

  // Set dynamic metadata
  useMetadata({
    title: searchText 
      ? `Search Results for "${searchText}" | Lokmat Bharat`
      : "Search | Lokmat Bharat",
    description: searchText
      ? `Search results for "${searchText}" on Lokmat Bharat. Find the latest news and articles.`
      : "Search for news and articles on Lokmat Bharat",
    keywords: searchText || "Search, News",
    url: searchText 
      ? `https://lokmat-next-base.vercel.app/news-search?search=${encodeURIComponent(searchText)}`
      : "https://lokmat-next-base.vercel.app/news-search",
  });

  return (
    <div>
      {searchText && (
        <SearchList 
          searchText={searchText}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

