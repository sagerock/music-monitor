'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileApi, followApi } from '@/lib/api';
import { Header } from '@/components/header';
import { ProfileHeader } from '@/components/profile-header';
import { UserActivity } from '@/components/user-activity';
import { UserWatchlist } from '@/components/user-watchlist';
import { FollowButton } from '@/components/follow-button';
import { Loader2, Activity, Heart, Lock } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function PublicProfilePage({ params }: ProfilePageProps) {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'watchlist'>('activity');

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['profile', 'user', params.userId],
    queryFn: () => profileApi.getUserProfile(params.userId),
    retry: 1,
  });

  if (authLoading || isLoading) {
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
  const isOwnProfile = profileData?.isOwner || false;
  const isFollowing = profileData?.isFollowing || false;
  const isLimited = false; // Not provided by API, default to false

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-red-600 mb-4">
            {(error as any)?.response?.status === 404 
              ? 'User not found' 
              : 'Failed to load profile'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to own profile page if viewing own profile
  if (isOwnProfile && typeof window !== 'undefined') {
    window.location.href = '/profile';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <ProfileHeader profile={profile} isOwnProfile={false} />
          
          {/* Follow Button */}
          {user && !isOwnProfile && profile.allowFollowers && (
            <div className="mt-4">
              <FollowButton userId={params.userId} />
            </div>
          )}
        </div>

        {/* Private Profile Message */}
        {isLimited && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center mb-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">This profile is private</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {profile.allowFollowers 
                ? 'Follow this user to see their activity and watchlist'
                : 'This user has a private profile'
              }
            </p>
          </div>
        )}

        {/* Tabs - Only show if not limited */}
        {!isLimited && (
          <>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="-mb-px flex space-x-8">
                {(profile.showActivity || isOwnProfile || isFollowing) && (
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
                )}
                {(profile.showWatchlist || isOwnProfile || isFollowing) && (
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
                )}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'activity' && (profile.showActivity || isOwnProfile || isFollowing) && (
              <UserActivity userId={params.userId} />
            )}
            {activeTab === 'watchlist' && (profile.showWatchlist || isOwnProfile || isFollowing) && (
              <UserWatchlist userId={params.userId} />
            )}
          </>
        )}
      </main>
    </div>
  );
}