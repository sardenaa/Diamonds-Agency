/**
 * Royal Tour Agency Performance Monitoring Engine
 * Measures Key Web Vitals (LCP, FID, CLS, FCP) in production.
 */

export interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

const sendMetric = async (metric: Metric) => {
  const color = metric.rating === 'good' ? '#10b981' : metric.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444';
  console.log(
    `%c[VITAL MONITOR] ${metric.name}: ${metric.value.toFixed(2)} ms/score (%c${metric.rating.toUpperCase()}%c)`,
    'color: #94a3b8; font-weight: bold;',
    `color: ${color}; font-weight: black;`,
    'color: #94a3b8; font-weight: bold;'
  );

  try {
    const payload = JSON.stringify({ metric, url: window.location.href });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', payload);
    } else {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch (err) {
    // Fail silently in production
  }
};

export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    if (name === 'CLS') {
      return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
    }
    if (name === 'FID') {
      return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
    }
    if (name === 'LCP') {
      return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
    }
    if (name === 'FCP') {
      return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
    }
    return 'good';
  };

  const createMetric = (name: string, value: number): Metric => ({
    name,
    value,
    rating: getRating(name, value),
    timestamp: new Date().toISOString()
  });

  // 1. First Contentful Paint (FCP)
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      sendMetric(createMetric('FCP', fcpEntry.startTime));
    } else {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          sendMetric(createMetric('FCP', fcp.startTime));
          observer.disconnect();
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    }
  } catch (e) {
    // Ignore observer errors
  }

  // 2. Largest Contentful Paint (LCP)
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        sendMetric(createMetric('LCP', lastEntry.startTime));
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}

  // 3. First Input Delay (FID)
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fid = (entry as any).processingStart - entry.startTime;
        sendMetric(createMetric('FID', fid));
      });
      observer.disconnect();
    });
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {}

  // 4. Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      sendMetric(createMetric('CLS', clsValue));
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
};
