import Axios, { AxiosRequestConfig } from "axios";

// Cache storage - stores data by URL key
const cache: Map<string, { data: any; timestamp: number }> = new Map();

// Track ongoing requests to prevent duplicate fetches
const ongoingRequests: Map<string, Promise<any>> = new Map();

// Cache expiration time (in milliseconds) - 5 minutes default
const CACHE_EXPIRY = 5 * 60 * 1000;

interface CacheOptions {
  expiry?: number; // Cache expiry time in milliseconds
  forceRefresh?: boolean; // Force refresh even if cached
}

/**
 * Cached Axios GET request
 * @param url - API URL
 * @param config - Axios config
 * @param options - Cache options
 * @returns Promise with cached or fresh data
 */
export async function cachedAxiosGet<T = any>(
  url: string,
  config?: AxiosRequestConfig,
  options: CacheOptions = {}
): Promise<T> {
  const { expiry = CACHE_EXPIRY, forceRefresh = false } = options;
  const cacheKey = url + JSON.stringify(config || {});

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < expiry) {
        // Return cached data if still valid
        return Promise.resolve(cached.data);
      } else {
        // Remove expired cache
        cache.delete(cacheKey);
      }
    }
  }

  // Check if request is already in progress
  const ongoingRequest = ongoingRequests.get(cacheKey);
  if (ongoingRequest) {
    return ongoingRequest;
  }

  // Create new request
  const requestPromise = Axios.get(url, config)
    .then((response) => {
      // Parse payload if it exists, but preserve other response data properties
      let data = response.data;
      if (response.data?.payload) {
        try {
          const parsedPayload = JSON.parse(response.data.payload);
          // Store metadata separately to avoid corrupting arrays
          const result = {
            _data: parsedPayload,
            _totalRecords: response.data.TotalRecords,
            _fullResponse: response.data,
            _isArray: Array.isArray(parsedPayload),
          };
          
          // Store in cache
          cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
          
          return result;
        } catch (e) {
          // If parsing fails, use original data
          data = response.data;
        }
      }

      // Store in cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    })
    .catch((error) => {
      // Remove from ongoing requests on error
      ongoingRequests.delete(cacheKey);
      throw error;
    })
    .finally(() => {
      // Remove from ongoing requests when done
      ongoingRequests.delete(cacheKey);
    });

  // Store ongoing request
  ongoingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Clear specific cache entry
 * @param url - API URL
 * @param config - Axios config (optional)
 */
export function clearCache(url: string, config?: AxiosRequestConfig) {
  const cacheKey = url + JSON.stringify(config || {});
  cache.delete(cacheKey);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  cache.clear();
  ongoingRequests.clear();
}

/**
 * Get cache size (for debugging)
 */
export function getCacheSize(): number {
  return cache.size;
}

