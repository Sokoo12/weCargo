/**
 * Performance utilities for application optimization
 */

// Lazy load specific large modules
export const lazyImport = async <T, I extends keyof T>(
  modulePromise: Promise<T>,
  namedImport: I
): Promise<T[I]> => {
  const module = await modulePromise;
  return module[namedImport];
};

// Preconnect to domains we know we'll need
export const preconnectToDomains = () => {
  if (typeof window === 'undefined') return;
  
  const domains = [
    'https://doodleipsum.com', // Image domain
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Lazy-load non-critical resources
export const deferNonCriticalAssets = (cb: () => void) => {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    // @ts-ignore - requestIdleCallback not in TS dom lib
    window.requestIdleCallback(cb);
  } else {
    setTimeout(cb, 1);
  }
};

// Defer stylesheet loading
export const deferStylesheet = (url: string) => {
  if (typeof window === 'undefined') return;
  
  deferNonCriticalAssets(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Get browser memory usage (Chrome only)
export const getMemoryUsage = (): number | null => {
  if (typeof window === 'undefined') return null;
  
  // @ts-ignore - not in TS dom lib
  if (window.performance && window.performance.memory) {
    // @ts-ignore - not in TS dom lib  
    return window.performance.memory.usedJSHeapSize / (1024 * 1024); // MB
  }
  
  return null;
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  const originalFetch = window.fetch;
  
  // Monitor fetch calls
  window.fetch = async function(...args) {
    const startTime = performance.now();
    try {
      const response = await originalFetch.apply(this, args);
      const endTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      if (endTime - startTime > 300) { // Log slow fetches
        console.warn(`Slow fetch: ${url} took ${Math.round(endTime - startTime)}ms`);
      }
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      console.error(`Fetch error after ${Math.round(endTime - startTime)}ms:`, error);
      throw error;
    }
  };
  
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.warn(`Long task detected: ${Math.round(entry.duration)}ms`);
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.error('PerformanceObserver for longtask not supported');
    }
  }
}; 