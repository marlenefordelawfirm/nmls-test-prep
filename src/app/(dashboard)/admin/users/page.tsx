'use client';

import { useState, useEffect } from 'react';
import { Users as UsersIcon, RefreshCw, Eye, AlertCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionTier: string;
  createdAt: string;
  _count: {
    testAttempts: number;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-8 border-l-4 border-l-blue-700">
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
        <AdminBreadcrumb items={[{ label: 'User Management' }]} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-blue-700" />
              User Management
            </h1>
            <p className="text-slate-600">
              View and manage user accounts and progress
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Total Users
          </p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Active Students
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter(u => u.role === 'STUDENT').length}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Admins
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-xl border border-slate-100 dark:border-neutral-700 dark:border-neutral-700">
          <p className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1">
            Premium Users
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter(u => u.subscriptionTier !== 'FREE').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    Subscription
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    Tests Completed
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-bold text-slate-600 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    Joined
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-neutral-700 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 dark:bg-neutral-800 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.name || 'No Name'}</p>
                      <p className="text-xs text-slate-600 dark:text-gray-400 dark:text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      user.role === 'ADMIN'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      user.subscriptionTier === 'FREE'
                        ? 'bg-slate-50 text-slate-600 border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">
                      {user._count.testAttempts}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="h-10 w-10 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 dark:bg-neutral-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center transition-all border border-slate-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
