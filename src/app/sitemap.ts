import { MetadataRoute } from 'next';
import configData from '@/components/Config';
import { httpClient, safeJsonParse, withSessionToken } from "@/utils/httpClient";

// Function to fetch all posts from API with pagination
async function getAllPosts() {
  const axiosConfig = withSessionToken(configData.SESSION_TOKEN);

  const allPosts: any[] = [];
  let offset = 0;
  const itemCount = 100; // Fetch more items per request to reduce API calls
  let hasMore = true;

  try {
    // Use languageId=3 for server-side (default)
    const languageId = 3;
    while (hasMore) {
      const apiUrl = `${configData.baseApiUrl}getPosts?languageId=${languageId}&offset=${offset}&itemcount=${itemCount}&categorySlug=&isFeature=0&isSlider=0&isSliderLeft=0&isSliderRight=0&isTrending=0&categoryId=0`;
      
      const response = await httpClient.get(apiUrl, axiosConfig);
      const data = safeJsonParse<any[]>(response.data?.payload, []);
      
      const posts = Array.isArray(data) ? data : [];
      
      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts.push(...posts);
        offset += itemCount;
        
        // If we got fewer posts than requested, we've reached the end
        if (posts.length < itemCount) {
          hasMore = false;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  return allPosts;
}

// Function to fetch all categories
async function getAllCategories() {
  const axiosConfig = withSessionToken(configData.SESSION_TOKEN);

  try {
    // Use languageId=3 for server-side (default)
    const languageId = 3;
    const menuApiUrl = `${configData.baseApiUrl}getHeaderMenu?languageId=${languageId}`;
    const response = await httpClient.get(menuApiUrl, axiosConfig);
    const data = safeJsonParse<any[]>(response.data?.payload, []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://lokmatbharat.com';
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Fetch all categories
  const categories = await getAllCategories();
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((cat: any) => cat?.CategorySlug)
    .map((cat: any) => ({
      url: `${baseUrl}/category/${cat.CategorySlug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  // Fetch all posts
  const posts = await getAllPosts();
  const postUrls: MetadataRoute.Sitemap = posts
    .filter((post: any) => post?.Slug)
    .map((post: any) => {
      // Get last modified date from post
      let lastModified = currentDate;
      if (post.CreatedOnStr) {
        try {
          lastModified = new Date(post.CreatedOnStr);
        } catch (e) {
          // Keep currentDate if parsing fails
        }
      } else if (post.CreatedOn) {
        try {
          lastModified = new Date(post.CreatedOn);
        } catch (e) {
          // Keep currentDate if parsing fails
        }
      }

      return {
        url: `${baseUrl}/details/${post.Slug}`,
        lastModified: lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

  // Combine all URLs
  return [...staticPages, ...categoryUrls, ...postUrls];
}

