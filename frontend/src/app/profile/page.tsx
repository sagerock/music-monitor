'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { Header } from '@/components/header';
import { ProfileHeader } from '@/components/profile-header';
import { ProfileEditForm } from '@/components/profile-edit-form';
import { UserActivity } from '@/components/user-activity';
import { UserWatchlist } from '@/components/user-watchlist';
import { Loader2, Edit, Activity, Heart } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'watchlist' | 'edit'>('activity');

  const { data: profileData, isLoading, refetch, error } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMyProfile(),
    enabled: !!user && !authLoading,
    retry: 1,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Please sign in to view your profile
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
        </div>
      </div>
    );
  }

  const profile = profileData?.data;

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 mb-4">
            {error?.response?.status === 401 
              ? 'Session expired. Please sign in again.' 
              : 'Failed to load profile'}
          </p>
          {error?.response?.status === 401 && (
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ProfileHeader profile={profile} isOwnProfile={true} />

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-spotify-green text-spotify-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Activity
              </div>
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'watchlist'
                  ? 'border-spotify-green text-spotify-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Watchlist
              </div>
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'edit'
                  ? 'border-spotify-green text-spotify-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' && <UserActivity userId={profile.id} />}
        {activeTab === 'watchlist' && <UserWatchlist userId={profile.id} />}
        {activeTab === 'edit' && (
          <ProfileEditForm
            profile={profile}
            onSuccess={() => {
              refetch();
              // Don't automatically switch tabs - let user stay on edit
              // setActiveTab('activity');
            }}
          />
        )}
      </main>
    </div>
  );
}