'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

/**
 * Syncs user's theme preference from database to next-themes on initial load
 */
export function ThemeSync() {
  const { theme, setTheme } = useTheme();
  const hasSync = useRef(false);

  useEffect(() => {
    // Only sync once on mount
    if (hasSync.current) return;

    const syncTheme = async () => {
      try {
        const response = await fetch('/api/user/settings');
        const result = await response.json();

        if (result.success && result.data?.theme) {
          const dbTheme = result.data.theme;
          // Only update if database theme is different from current theme
          // This prevents unnecessary re-renders and flashing
          if (theme && dbTheme !== theme) {
            setTheme(dbTheme);
          }
        }
        hasSync.current = true;
      } catch (error) {
        // If user is not logged in or fetch fails, just use localStorage theme
        console.debug('Theme sync skipped:', error);
        hasSync.current = true;
      }
    };

    // Only sync after theme is loaded from localStorage
    if (theme) {
      syncTheme();
    }
  }, [theme, setTheme]);

  return null; // This component doesn't render anything
}
