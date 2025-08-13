'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import { Bell, BellOff, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

interface AlertButtonProps {
  artistId: string;
}

export function AlertButton({ artistId }: AlertButtonProps) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [threshold, setThreshold] = useState(5);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const { user } = useAuth();

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

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
    enabled: !!user, // Only fetch if logged in
    retry: false,
  });

  useEffect(() => {
    if (alertsData?.data) {
      const alert = alertsData.data.find((a: any) => a.artistId === artistId && a.isActive);
      setActiveAlert(alert);
    }
  }, [alertsData, artistId]);

  const createMutation = useMutation({
    mutationFn: () => alertsApi.createAlert(artistId, threshold),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert created successfully');
      setShowModal(false);
    },
    onError: () => {
      toast.error('Failed to create alert');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertsApi.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert removed');
      setActiveAlert(null);
    },
    onError: () => {
      toast.error('Failed to remove alert');
    },
  });

  const handleCreate = () => {
    createMutation.mutate();
  };

  const handleDelete = () => {
    if (activeAlert) {
      deleteMutation.mutate(activeAlert.id);
    }
  };

  const isLoading = createMutation.isPending || deleteMutation.isPending;

  const handleClick = () => {
    if (!user) {
      toast.info('Please log in to set alerts');
      return;
    }
    if (activeAlert) {
      handleDelete();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors',
          activeAlert
            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : activeAlert ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        <span>{activeAlert ? 'Remove Alert' : 'Set Alert'}</span>
      </button>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 z-50 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Set Momentum Alert</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get notified when this artist's momentum score exceeds the threshold.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Momentum Threshold
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Low (1)</span>
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {threshold}
                </span>
                <span>High (20)</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-spotify-green text-white font-medium rounded-lg hover:bg-spotify-green/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Create Alert'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}