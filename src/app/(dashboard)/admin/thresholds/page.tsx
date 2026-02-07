'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, RefreshCw, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';

interface FinancialThreshold {
  id: string;
  key: string;
  value: number;
  year: number;
  source: string;
  lastUpdated: string;
  isActive: boolean;
}

export default function ThresholdsAdminPage() {
  const [thresholds, setThresholds] = useState<FinancialThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/thresholds');
      const data = await response.json();

      if (data.success) {
        setThresholds(data.thresholds);
      } else {
        setError(data.error || 'Failed to fetch thresholds');
      }
    } catch (err) {
      setError('Network error fetching thresholds');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (threshold: FinancialThreshold) => {
    setEditingId(threshold.id);
    setEditValue(threshold.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/thresholds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editValue }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setThresholds(prev =>
          prev.map(t => (t.id === id ? data.threshold : t))
        );
        setEditingId(null);
      } else {
        setError(data.error || 'Failed to update threshold');
      }
    } catch (err) {
      setError('Network error updating threshold');
    } finally {
      setSaving(false);
    }
  };

  const formatKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${value.toLocaleString()}`;
    }
    return `${value}%`;
  };

  const checkForUpdates = async () => {
    setUpdating(true);
    setError(null);
    setUpdateResult(null);

    try {
      const response = await fetch('/api/admin/thresholds/update', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setUpdateResult(data.message);
        if (data.updatesApplied > 0) {
          // Refresh thresholds if any were updated
          await fetchThresholds();
        }
      } else {
        setError(data.error || 'Update check failed');
      }
    } catch (err) {
      setError('Network error checking for updates');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-700 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
        <AdminBreadcrumb items={[{ label: 'Financial Thresholds' }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Financial Thresholds Management
            </h1>
              <p className="text-slate-600">
                Manage NMLS regulatory financial thresholds and limits
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={checkForUpdates}
                disabled={updating}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
              >
                {updating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Check for Updates
                  </>
                )}
              </button>
              <button
                onClick={fetchThresholds}
                className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {updateResult && (
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Update Check Complete</p>
                <p className="text-sm text-emerald-700">{updateResult}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Total Thresholds
            </p>
            <p className="text-2xl font-bold text-slate-900">{thresholds.length}</p>
          </div>
          <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Active
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {thresholds.filter(t => t.isActive).length}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
              Current Year
            </p>
            <p className="text-2xl font-bold text-slate-900">2026</p>
          </div>
        </div>

        {/* Thresholds Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Threshold
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Year
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((threshold) => (
                  <tr key={threshold.id} className="border-b border-slate-100 dark:border-neutral-700 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{formatKey(threshold.key)}</p>
                        <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400 font-mono">{threshold.key}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseFloat(e.target.value))}
                          className="w-32 px-3 py-2 border border-slate-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(threshold.value)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">{threshold.year}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                        {threshold.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {new Date(threshold.lastUpdated).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {threshold.isActive ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-gray-400 text-xs font-bold rounded-full border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === threshold.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(threshold.id)}
                              disabled={saving}
                              className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                            >
                              {saving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="h-10 w-10 bg-slate-100 dark:bg-neutral-800 dark:bg-neutral-800 hover:bg-slate-200 dark:bg-neutral-700 disabled:opacity-50 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(threshold)}
                            className="h-10 w-10 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:bg-neutral-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">About Financial Thresholds</p>
              <p className="text-sm text-blue-700">
                These thresholds are used throughout the application for question generation and calculations.
                Updates are automatically synced from official sources (FHFA, HUD, CFPB, VA).
                Manual edits should only be made when official values change.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
