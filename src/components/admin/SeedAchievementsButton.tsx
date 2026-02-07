'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function SeedAchievementsButton() {
  const [loading, setLoading] = useState(false);

  const handleSeedAchievements = async () => {
    if (!confirm('Are you sure you want to seed/update all achievements?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/seed-achievements', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        alert(`Success! ${result.message}`);
      } else {
        alert('Failed to seed achievements: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeedAchievements}
      disabled={loading}
      className="w-full h-10 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm shadow-sm"
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Seeding...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Seed Achievements
        </>
      )}
    </button>
  );
}
