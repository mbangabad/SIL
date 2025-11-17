/**
 * PageViewTracker Component
 * Tracks page views for analytics
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
// import { telemetry } from '@sil/core'; // TODO: Fix telemetry import after package build

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      // telemetry.trackPageView(pathname, document.referrer); // TODO: Enable after fixing telemetry import
      console.log('Page view:', pathname); // Temporary logging
    }
  }, [pathname]);

  return null;
}
