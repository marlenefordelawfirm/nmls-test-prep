'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { User, Bell, BookOpen, Palette, Eye, Shield, Save, RefreshCw, Trash2 } from 'lucide-react';

interface SettingsData {
  emailNotifications: boolean;
  studyReminders: boolean;
  achievementAlerts: boolean;
  weeklyProgress: boolean;
  questionsPerTest: number;
  enableTimeLimit: boolean;
  timeLimitMinutes: number;
  showExplanations: boolean;
  theme: string;
  fontSize: string;
  reduceMotion: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionTier: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUserProfile();
  }, []);

  // Sync theme from next-themes to settings when loaded
  // Only update if there's an actual mismatch to prevent unnecessary re-renders
  useEffect(() => {
    if (settings && theme && settings.theme !== theme) {
      // Use a timeout to avoid rapid updates during initial load
      const timeoutId = setTimeout(() => {
        setSettings((prev) => {
          if (!prev || prev.theme === theme) return prev;
          return {
            ...prev,
            theme: theme,
          };
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [theme, settings?.theme]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/user/settings');
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch settings');
      }

      setSettings(result.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const result = await response.json();

      if (response.ok && result.success) {
        setUserProfile(result.data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't set error here, just log it - subscription info is not critical
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save settings');
      }

      setSettings(result.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    if (!settings) return;

    // If updating theme, also update next-themes
    if (key === 'theme' && typeof value === 'string') {
      setTheme(value);
    }

    setSettings({
      ...settings,
      [key]: value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{error || 'No settings data available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 dark:bg-neutral-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-gray-400 dark:text-gray-400">
                Manage your account and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-4 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              Settings saved successfully!
            </p>
          </div>
        )}

        {/* Profile Information Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-blue-700 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                Profile Information
              </h2>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                To update your name or email address, please contact support. All other preferences can be customized below.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Email Notifications</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Receive updates via email</p>
              </div>
              <button
                onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Study Reminders</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Get reminders to study daily</p>
              </div>
              <button
                onClick={() => updateSetting('studyReminders', !settings.studyReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.studyReminders ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.studyReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Achievement Alerts</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Celebrate when you unlock achievements</p>
              </div>
              <button
                onClick={() => updateSetting('achievementAlerts', !settings.achievementAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.achievementAlerts ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.achievementAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Weekly Progress Report</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Get weekly summary of your progress</p>
              </div>
              <button
                onClick={() => updateSetting('weeklyProgress', !settings.weeklyProgress)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.weeklyProgress ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.weeklyProgress ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Study Preferences</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white dark:text-white mb-2">
                Questions Per Practice Test
              </label>
              <select
                value={settings.questionsPerTest}
                onChange={(e) => updateSetting('questionsPerTest', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              >
                <option value={10}>10 questions</option>
                <option value={20}>20 questions</option>
                <option value={30}>30 questions</option>
                <option value={50}>50 questions</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Enable Time Limit</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Add time pressure to practice tests</p>
              </div>
              <button
                onClick={() => updateSetting('enableTimeLimit', !settings.enableTimeLimit)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableTimeLimit ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableTimeLimit ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.enableTimeLimit && (
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white dark:text-white mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={settings.timeLimitMinutes}
                  onChange={(e) => updateSetting('timeLimitMinutes', parseInt(e.target.value))}
                  min={5}
                  max={120}
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-900 dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Show Explanations</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Display answer explanations after each question</p>
              </div>
              <button
                onClick={() => updateSetting('showExplanations', !settings.showExplanations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showExplanations ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showExplanations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance & Accessibility */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Appearance & Accessibility</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white dark:text-white mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
              <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 mt-1">
                Changes here sync with the theme toggle in the top bar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white dark:text-white mb-2">
                Font Size
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-neutral-900 dark:bg-neutral-800 border border-slate-300 dark:border-slate-600 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white dark:text-white focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white dark:text-white">Reduce Motion</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">Minimize animations and transitions</p>
              </div>
              <button
                onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reduceMotion ? 'bg-blue-700' : 'bg-slate-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-white dark:bg-neutral-900 dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white">Account Management</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Subscription Status</p>
                  {userProfile ? (
                    <>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {userProfile.subscriptionTier === 'FREE' && 'Free Plan - Active'}
                        {userProfile.subscriptionTier === 'MONTHLY' && 'Monthly Plan - Active'}
                        {userProfile.subscriptionTier === 'ANNUAL' && 'Annual Plan - Active'}
                      </p>
                      {userProfile.subscriptionTier !== 'FREE' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Manage your subscription in your account dashboard
                        </p>
                      )}
                      {userProfile.subscriptionTier === 'FREE' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Upgrade to unlock premium features
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-blue-700 dark:text-blue-300">Loading...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Delete Account</p>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    disabled
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors cursor-not-allowed"
                  >
                    Delete Account (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
