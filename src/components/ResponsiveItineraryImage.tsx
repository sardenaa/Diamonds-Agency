import React, { useState, useEffect } from 'react';
import LazyImage from './LazyImage.js';

interface ResponsiveItineraryImageProps {
  src: string;
  alt: string;
  className?: string;
  mobileAspect?: string;  // e.g. "aspect-[4/3]" or "aspect-square"
  desktopAspect?: string; // e.g. "aspect-[16/9]"
}

/**
 * Strips existing Unsplash size and crop parameters and applies
 * optimal dimensions, quality, and aspect-ratio parameters for
 * mobile vs desktop displays, optimizing bandwidth and LCP.
 */
export function getResponsiveUnsplashUrl(url: string, isMobile: boolean) {
  if (!url) return '';
  if (!url.includes('unsplash.com')) return url;

  // Split to get the base url
  const baseUrl = url.split('?')[0];

  if (isMobile) {
    // Mobile: 4:3 aspect ratio, compact dimensions (640x480), high compression (q=75) for fast cellular loading
    return `${baseUrl}?auto=format&fit=crop&q=75&w=640&h=480&crop=entropy`;
  } else {
    // Desktop: 16:9 aspect ratio, spacious dimensions (1200x675), high quality (q=85) for premium displays
    return `${baseUrl}?auto=format&fit=crop&q=85&w=1200&h=675&crop=entropy`;
  }
}

export default function ResponsiveItineraryImage({
  src,
  alt,
  className = '',
  mobileAspect = 'aspect-[4/3]',
  desktopAspect = 'aspect-[16/9]',
}: ResponsiveItineraryImageProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleResize);
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  const optimizedSrc = getResponsiveUnsplashUrl(src, isMobile);

  return (
    <div className={`w-full h-full overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50 shadow-sm ${isMobile ? mobileAspect : desktopAspect}`}>
      <LazyImage
        src={optimizedSrc}
        alt={alt}
        className={`${className} w-full h-full object-cover`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
