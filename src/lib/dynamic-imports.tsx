import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Helper for dynamically importing heavy components only when needed
 */
export function createDynamicComponent<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  loadingComponent: React.ReactNode = null,
  ssr: boolean = false
) {
  return dynamic(importFn, {
    loading: () => <>{loadingComponent}</>,
    ssr,
  });
}

/**
 * Predefined dynamic imports for common heavy components
 */

// Charts
export const DynamicAreaChart = createDynamicComponent(() => 
  import('recharts').then(mod => ({ default: mod.AreaChart }))
);

export const DynamicLineChart = createDynamicComponent(() => 
  import('recharts').then(mod => ({ default: mod.LineChart }))
);

export const DynamicBarChart = createDynamicComponent(() => 
  import('recharts').then(mod => ({ default: mod.BarChart }))
);

// UI Components
export const DynamicDropzone = createDynamicComponent(
  () => import('react-dropzone').then(mod => ({ default: mod.default }))
);

// Animation components
export const DynamicMotionDiv = createDynamicComponent(() => 
  import('framer-motion').then(mod => ({ default: mod.motion.div }))
, null, true);

export const DynamicMotionUl = createDynamicComponent(() => 
  import('framer-motion').then(mod => ({ default: mod.motion.ul }))
, null, true);

// Example usage:
// const DynamicComponent = createDynamicComponent(() => import('./HeavyComponent')); 