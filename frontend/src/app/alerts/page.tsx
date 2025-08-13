'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Loader2, Bell, BellOff, LogIn, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    // Set the Supabase token in localStorage for API calls
    const getToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
    };
    if (user) getToken();
  }, [user]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
    enabled: isLoggedIn,
    retry: false,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      alertsApi.updateAlert(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      toast.success('Alert updated');
    },
    onError: () => {
      toast.error('Failed to update alert');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertsApi.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['alerts']);
      toast.success('Alert deleted');
    },
    onError: () => {
      toast.error('Failed to delete alert');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Momentum Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get notified when artists reach momentum thresholds
          </p>
        </div>

        {authLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Sign in to set alerts</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create an account to get notifications about rising artists
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-white font-medium rounded-full hover:bg-spotify-green/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">Unable to load alerts</p>
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Triggered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {data.data.map((alert: any) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/artist/${alert.artistId}`}
                        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-spotify-green"
                      >
                        {alert.artist.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {alert.threshold}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleMutation.mutate({ id: alert.id, isActive: !alert.isActive })}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                          alert.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        )}
                      >
                        {alert.isActive ? (
                          <>
                            <Bell className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3 h-3" />
                            Paused
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {alert.lastTriggered
                          ? new Date(alert.lastTriggered).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteMutation.mutate(alert.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No alerts set</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Set alerts on artist pages to get notified when they're trending
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-spotify-green text-white font-medium rounded-lg hover:bg-spotify-green/90 transition-colors"
            >
              Browse Artists
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}