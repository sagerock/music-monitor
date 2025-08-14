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
  const [alertType, setAlertType] = useState<'momentum' | 'comment' | 'rating'>('momentum');
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
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
      const alerts = alertsData.data.filter((a: any) => a.artistId === artistId && a.isActive);
      setActiveAlerts(alerts);
    }
  }, [alertsData, artistId]);

  const createMutation = useMutation({
    mutationFn: () => {
      // Check if alert already exists before making API call
      const existingAlert = activeAlerts.find(a => 
        (a.alertType || 'momentum') === alertType
      );
      
      if (existingAlert) {
        throw new Error(`${alertType} alert already exists for this artist`);
      }
      
      return alertsApi.createAlert(artistId, alertType, alertType === 'momentum' ? threshold : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(`${alertType.charAt(0).toUpperCase() + alertType.slice(1)} alert created successfully`);
      setShowModal(false);
    },
    onError: (error: any) => {
      console.error('Alert creation error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create alert';
      
      // If it's a duplicate alert error, refresh the alerts list
      if (errorMessage.includes('already exists')) {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      }
      
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertsApi.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert removed');
    },
    onError: () => {
      toast.error('Failed to remove alert');
    },
  });

  const handleCreate = () => {
    createMutation.mutate();
  };

  const handleDelete = (alertId?: number) => {
    if (alertId) {
      deleteMutation.mutate(alertId);
    } else if (activeAlerts.length === 1) {
      deleteMutation.mutate(activeAlerts[0].id);
    }
  };

  const isLoading = createMutation.isPending || deleteMutation.isPending;

  const handleClick = () => {
    if (!user) {
      toast.info('Please log in to set alerts');
      return;
    }
    setShowModal(true);
  };

  const hasActiveAlerts = activeAlerts.length > 0;
  const getMomentumAlert = () => activeAlerts.find(a => (a.alertType || 'momentum') === 'momentum');
  const getCommentAlert = () => activeAlerts.find(a => a.alertType === 'comment');
  const getRatingAlert = () => activeAlerts.find(a => a.alertType === 'rating');

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors',
          hasActiveAlerts
            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        <span>
          {hasActiveAlerts ? `Alerts (${activeAlerts.length})` : 'Set Alerts'}
        </span>
      </button>

      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 z-50 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Alerts</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose what types of notifications you want for this artist.
            </p>
            
            {/* Active Alerts */}
            {hasActiveAlerts && (
              <div className="mb-6 space-y-2">
                <h4 className="text-sm font-medium mb-2">Active Alerts</h4>
                {getMomentumAlert() && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm">Momentum alerts (threshold: {getMomentumAlert().threshold})</span>
                    <button
                      onClick={() => handleDelete(getMomentumAlert().id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {getCommentAlert() && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm">Comment notifications</span>
                    <button
                      onClick={() => handleDelete(getCommentAlert().id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {getRatingAlert() && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-sm">Rating notifications</span>
                    <button
                      onClick={() => handleDelete(getRatingAlert().id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Create New Alert */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Create New Alert</h4>
              
              {/* Alert Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Alert Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as 'momentum' | 'comment' | 'rating')}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  disabled={
                    (alertType === 'momentum' && getMomentumAlert()) ||
                    (alertType === 'comment' && getCommentAlert()) ||
                    (alertType === 'rating' && getRatingAlert())
                  }
                >
                  <option value="momentum" disabled={getMomentumAlert()}>
                    Momentum Score {getMomentumAlert() ? '(Already active)' : ''}
                  </option>
                  <option value="comment" disabled={getCommentAlert()}>
                    New Comments {getCommentAlert() ? '(Already active)' : ''}
                  </option>
                  <option value="rating" disabled={getRatingAlert()}>
                    New Ratings {getRatingAlert() ? '(Already active)' : ''}
                  </option>
                </select>
              </div>
              
              {/* Momentum Threshold (only for momentum alerts) */}
              {alertType === 'momentum' && !getMomentumAlert() && (
                <div className="mb-4">
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
              )}
              
              {/* Description based on alert type */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {alertType === 'momentum' && 'Get notified when momentum score exceeds your threshold.'}
                {alertType === 'comment' && 'Get notified when someone comments on this artist.'}
                {alertType === 'rating' && 'Get notified when someone rates this artist.'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Close
              </button>
              {((alertType === 'momentum' && !getMomentumAlert()) ||
                (alertType === 'comment' && !getCommentAlert()) ||
                (alertType === 'rating' && !getRatingAlert())) && (
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
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}