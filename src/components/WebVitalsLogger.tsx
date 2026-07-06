import { useEffect } from 'react';
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

export default function WebVitalsLogger() {
  useEffect(() => {
    // Only log in production/console for diagnostics
    const logMetric = (metric: any) => {
      console.log(
        `%c[Core Web Vitals] %c${metric.name}: %c${metric.value.toFixed(2)} %c(Rating: ${metric.rating})`,
        'color: #f59e0b; font-weight: bold;',
        'color: #38bdf8; font-weight: bold;',
        'color: #10b981; font-weight: black;',
        metric.rating === 'good' ? 'color: #10b981;' : metric.rating === 'needs-improvement' ? 'color: #f59e0b;' : 'color: #ef4444;'
      );
    };

    try {
      onLCP(logMetric);
      onINP(logMetric);
      onCLS(logMetric);
      onFCP(logMetric);
      onTTFB(logMetric);
    } catch (err) {
      console.warn('Web Vitals logging could not be fully initialized:', err);
    }
  }, []);

  return null;
}
