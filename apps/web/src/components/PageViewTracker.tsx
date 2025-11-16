/**
 * PageViewTracker Component
 * Tracks page views for analytics
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { telemetry } from '@sil/core';

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      telemetry.trackPageView(pathname, document.referrer);
    }
  }, [pathname]);

  return null;
}
