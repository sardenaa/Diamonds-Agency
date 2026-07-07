import { Tour } from '../types.js';

const CACHE_NAME = 'mas-tour-images';

/**
 * Robust Client-side Cache Manager to prefetch and cache premium high-resolution tour imagery.
 * Works seamlessly offline by leveraging the Cache Storage API or local storage base64 fallbacks.
 */
export class CacheManager {
  /**
   * Caches an individual image URL into the Cache Storage API.
   * If the Cache API is unavailable, it gracefully falls back to base64 localStorage caching.
   */
  static async cacheImage(url: string): Promise<boolean> {
    if (!url) return false;

    try {
      // 1. Attempt standard Cache API (Service Worker standard storage)
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse) {
          return true; // Already cached
        }

        const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
          await cache.put(url, response.clone());
          return true;
        }
      }
    } catch (err) {
      console.warn(`Cache Storage API failed for ${url}, attempting localStorage fallback:`, err);
    }

    // 2. Fallback to Base64 in LocalStorage for offline resilience
    try {
      const storageKey = `mas_img_cache_${url}`;
      if (localStorage.getItem(storageKey)) {
        return true; // Already cached in localStorage
      }

      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return false;

      const blob = await response.blob();
      return new Promise<boolean>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            localStorage.setItem(storageKey, base64data);
            resolve(true);
          } catch (storageErr) {
            console.warn('LocalStorage quota exceeded during fallback image caching:', storageErr);
            resolve(false);
          }
        };
        reader.onerror = () => resolve(false);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error(`Offline image caching failed entirely for ${url}:`, err);
      return false;
    }
  }

  /**
   * Retrieves a cached image as a local URL or base64 string for direct <img> consumption.
   */
  static async getCachedImage(url: string): Promise<string> {
    if (!url) return '';

    try {
      // 1. Try Cache API first
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          return URL.createObjectURL(blob);
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch ${url} from Cache Storage:`, err);
    }

    // 2. Try LocalStorage Base64 fallback
    try {
      const storageKey = `mas_img_cache_${url}`;
      const base64Data = localStorage.getItem(storageKey);
      if (base64Data) {
        return base64Data;
      }
    } catch (err) {
      console.error(`Failed to retrieve ${url} from localStorage:`, err);
    }

    // 3. Fallback to the live network URL
    return url;
  }

  /**
   * Pre-fetches and caches all high-resolution imagery for a list of tours.
   */
  static async prefetchTourImages(tours: Tour[]): Promise<void> {
    if (!tours || tours.length === 0) return;

    // Collect all image URLs from the catalog tours
    const imageUrls: string[] = [];
    tours.forEach((tour) => {
      if (tour.images && Array.isArray(tour.images)) {
        tour.images.forEach((img) => {
          if (img && !imageUrls.includes(img)) {
            imageUrls.push(img);
          }
        });
      }
    });

    // Cache them in small chunks in the background to prevent thread block
    const chunkAndCache = async (urls: string[]) => {
      for (const url of urls) {
        // Run asynchronously without blocking the loop
        this.cacheImage(url).catch((err) =>
          console.warn(`Background image prefetch failed for: ${url}`, err)
        );
      }
    };

    // Run chunking
    chunkAndCache(imageUrls);
  }
}
