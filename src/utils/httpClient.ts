import Axios, { AxiosRequestConfig } from "axios";

/**
 * Shared Axios client for server-side requests.
 *
 * Why:
 * - On some VPS setups `HTTP_PROXY` / `HTTPS_PROXY` env vars are set, which can force
 *   Node to connect to a proxy (e.g. 141.164.60.162:8039) and cause ETIMEDOUT.
 * - We explicitly disable proxy usage and set a reasonable timeout so `npm start`
 *   doesn't crash the app when upstream is slow/unreachable.
 */
export const httpClient = Axios.create({
  timeout: 15_000,
  // Critical: don't use env-based proxy for these requests
  proxy: false,
});

export function withSessionToken(
  sessionToken: string,
  config?: AxiosRequestConfig
): AxiosRequestConfig {
  return {
    ...(config || {}),
    headers: {
      ...(config?.headers || {}),
      sessionToken,
    },
    // Also ensure per-request proxy is disabled.
    proxy: false,
    timeout: config?.timeout ?? 15_000,
  };
}

export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Fetches an API response that contains a JSON string in `data.payload`,
 * returning a parsed value or a fallback on any error (timeouts, etc).
 */
export async function safeGetPayloadJson<T>(
  url: string,
  config: AxiosRequestConfig,
  fallback: T
): Promise<T> {
  try {
    const res = await httpClient.get(url, config);
    return safeJsonParse<T>(res.data?.payload, fallback);
  } catch (e) {
    // Keep logs minimal in production; callers can also log if needed.
    if (process.env.NODE_ENV !== "production") {
      console.error("API fetch failed:", url, e);
    }
    return fallback;
  }
}
