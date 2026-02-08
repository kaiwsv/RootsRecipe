
import { getLinkPreview } from "link-preview-js";

export interface LinkMetadata {
  title?: string;
  description?: string;
  images?: string[];
  favicons?: string[];
  url: string;
}

export const fetchLinkMetadata = async (url: string): Promise<LinkMetadata | null> => {
  // Try a faster proxy first, then fallback to AllOrigins if needed.
  const proxies = [
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
  ];

  for (const getProxyUrl of proxies) {
    try {
      const proxyUrl = getProxyUrl(url);
      
      // Use a timeout to ensure we don't hang the UI forever on slow proxies
      const result = await Promise.race([
        getLinkPreview(proxyUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 6000))
      ]);

      if (result && typeof result === 'object' && "title" in result) {
        return {
          title: result.title,
          description: result.description,
          images: result.images,
          favicons: result.favicons,
          url: url,
        };
      }
    } catch (error) {
      console.warn(`Link preview attempt failed for ${url} via proxy. Error:`, error);
      // Continue to next proxy in the loop
      continue;
    }
  }

  // If all proxies fail or timeout, return null gracefully
  return null;
};
