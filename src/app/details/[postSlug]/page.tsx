import { Metadata } from "next";
import configData from "@/components/Config";
import { httpClient, safeJsonParse, withSessionToken } from "@/utils/httpClient";
import { cache } from "react";

// Server-side function to fetch post details for metadata
async function safeGetPostForMetadata(postSlug: string) {
  try {
    const response = await httpClient.get(
      `${configData.POST_DETAIL_API_URL}${postSlug}`,
      withSessionToken(configData.SESSION_TOKEN, { timeout: 5_000 })
    );
    return safeJsonParse<any>(response.data?.payload, null);
  } catch {
    // Don't crash SSR/metadata on slow backend
    return null;
  }
}

const getPostDetailsForMetadata = cache(async function getPostDetailsForMetadata(
  postSlug: string
) {
  return await safeGetPostForMetadata(postSlug);
});

// Generate metadata for SEO and social sharing (runs on server)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ postSlug: string }>;
}): Promise<Metadata> {
  const { postSlug } = await params;
  const post = await getPostDetailsForMetadata(postSlug);

  if (!post) {
    return {
      title: "Post Not Found | Lokmat Bharat",
      description: "The requested post could not be found.",
    };
  }

  const title = post.TitleData?.[0]?.Translation || "News Article";
  const description = post.DescriptionData?.[0]?.Translation
    ? post.DescriptionData[0].Translation.replace(/<[^>]*>/g, "").substring(0, 160)
    : "Read the latest news on Lokmat Bharat";
  
  // Ensure image URL is absolute
  let imageUrl = post.PostFiles?.[0]?.AssetLiveUrl || "";
  if (imageUrl && !imageUrl.startsWith("http")) {
    if (imageUrl.startsWith("//")) {
      imageUrl = `https:${imageUrl}`;
    } else if (imageUrl.startsWith("/")) {
      imageUrl = `https://storage.googleapis.com${imageUrl}`;
    } else {
      imageUrl = `https://storage.googleapis.com/${imageUrl}`;
    }
  }
  
  // Fallback to default image if no image found
  if (!imageUrl) {
    imageUrl = "https://lokmatbharat.com/assets/images/social.jpg";
  }

  const url = `https://lokmatbharat.com/details/${postSlug}`;
  const siteName = "Lokmat Bharat";

  // Return metadata that completely overrides parent layout metadata
  // In Next.js 16, child page metadata should override parent, but we need to be explicit
  const metadata: Metadata = {
    title: `${title} | Lokmat Bharat`,
    description,
    keywords: post.CategoryName || "News, Hindi News, Lokmat Bharat",
    // Explicitly set openGraph to override layout's openGraph completely
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: siteName,
      type: "article",
      locale: "hi_IN",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
      creator: "@navtejtv",
      site: "@navtejtv",
    },
    alternates: {
      canonical: url,
    },
    other: {
      "article:published_time": post.CreatedOnStr || "",
      "article:author": siteName,
      "article:section": post.CategoryName || "News",
    },
  };

  return metadata;
}

import CategoryDetailClient from "./CategoryDetailClient";

export default async function CategoryDetailPage({ params }: { params: Promise<{ postSlug: string }> }) {
  const { postSlug } = await params;
  return (
    <>
      <head>
        <link rel="amphtml" href={`https://lokmatbharat.com/amp/details/${postSlug}`} />
      </head>
      <CategoryDetailClient params={params} />
    </>
  );
}
