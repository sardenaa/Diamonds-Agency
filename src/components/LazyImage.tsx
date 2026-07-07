import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderBg?: string;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholderBg = 'bg-slate-800/20',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: '150px', // Load early before reaching the screen to improve LCP feel
        threshold: 0.01,
      }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (observer && currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, []);

  // Handle modern Cache Storage API caching for full offline readiness
  useEffect(() => {
    if (!isInView || !src) return;

    let isMounted = true;
    let createdUrl: string | null = null;

    const loadAndCacheImage = async () => {
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open('mas-tour-images');
          const cachedResponse = await cache.match(src);

          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            createdUrl = URL.createObjectURL(blob);
            if (isMounted) {
              setDisplaySrc(createdUrl);
              return;
            }
          }

          // Fetch and cache the high-resolution image asynchronously if online
          if (navigator.onLine) {
            try {
              const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
              if (response.ok) {
                await cache.put(src, response.clone());
                const blob = await response.blob();
                createdUrl = URL.createObjectURL(blob);
                if (isMounted) {
                  setDisplaySrc(createdUrl);
                  return;
                }
              }
            } catch (fetchErr) {
              // CORS blocker fallback, bind src directly to displaySrc
              if (isMounted) {
                setDisplaySrc(src);
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Image Cache Storage error, falling back to direct load:', err);
        }
      }

      // Default fallback
      if (isMounted) {
        setDisplaySrc(src);
      }
    };

    loadAndCacheImage();

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src, isInView]);

  return (
    <div className={`relative overflow-hidden w-full h-full ${placeholderBg}`}>
      {/* Skeleton loading block while not loaded or not in view */}
      {(!isLoaded || !isInView) && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/10 via-slate-800/20 to-slate-800/10 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      )}

      {isInView && displaySrc && (
        <img
          ref={imgRef}
          src={displaySrc}
          alt={alt}
          className={`${className} transition-opacity duration-700 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
}
