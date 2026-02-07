'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = async () => {
    console.log('🎨 Theme toggle clicked!');
    console.log('Current theme:', theme);
    console.log('Resolved theme:', resolvedTheme);

    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    console.log('Setting new theme to:', newTheme);

    setTheme(newTheme);

    // Log HTML element class after a short delay to see if it changed
    setTimeout(() => {
      console.log('HTML classes after toggle:', document.documentElement.className);
    }, 100);

    // Also save to database for persistence across devices
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: newTheme }),
      });
      console.log('✅ Theme saved to database');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Theme still works via localStorage, just won't sync to other devices
    }
  };

  // Prevent flash by rendering a neutral button until mounted
  // Use the same styling as the mounted button to avoid layout shift
  if (!mounted) {
    return (
      <button
        className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 opacity-50"
        disabled
        aria-label="Loading theme"
      >
        <div className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleThemeToggle}
      className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all shadow-sm"
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
