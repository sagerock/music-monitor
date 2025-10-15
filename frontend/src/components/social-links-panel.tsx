'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialsApi, ArtistSocial, api } from '@/lib/api';
import { Plus, Trash2, ExternalLink, Check, X, Youtube, Instagram, Twitter, Facebook, Music2, RefreshCw, Disc3 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

interface SocialLinksPanelProps {
  artistId: string;
  artistName: string;
}

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music2, // Using Music2 as TikTok icon placeholder
  twitter: Twitter,
  facebook: Facebook,
  bandcamp: Disc3,
};

const platformColors = {
  youtube: 'text-red-600',
  instagram: 'text-pink-600',
  tiktok: 'text-gray-900 dark:text-gray-100',
  twitter: 'text-blue-400',
  facebook: 'text-blue-600',
  bandcamp: 'text-cyan-600',
};

export function SocialLinksPanel({ artistId, artistName }: SocialLinksPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState<string>('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [isUpdatingStats, setIsUpdatingStats] = useState(false);

  const { data: socialsData, isLoading } = useQuery({
    queryKey: ['artist-socials', artistId],
    queryFn: () => socialsApi.getArtistSocials(artistId),
  });

  const addMutation = useMutation({
    mutationFn: ({ platform, url }: { platform: string; url: string }) =>
      socialsApi.addSocial(artistId, platform, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-socials', artistId] });
      setShowAddForm(false);
      setNewUrl('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to add social link');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => socialsApi.deleteSocial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-socials', artistId] });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => socialsApi.updateSocial(id, { verified: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-socials', artistId] });
    },
  });

  const handleAddSocial = () => {
    if (!newUrl) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    addMutation.mutate({ platform: newPlatform, url: newUrl });
  };

  const handleUpdateStats = async () => {
    setIsUpdatingStats(true);
    setError('');
    
    try {
      // Use the API URL from environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/jobs/update-social-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'secret': process.env.NEXT_PUBLIC_CRON_SECRET || 'cronJobSecret123'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update stats result:', result);
      
      // Wait a moment for the update to process
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['artist-socials', artistId] });
        setIsUpdatingStats(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update social stats:', error);
      setError('Failed to update stats. Check console for details.');
      setIsUpdatingStats(false);
    }
  };

  const socials = socialsData?.data || [];
  const existingPlatforms = new Set(socials.map(s => s.platform));
  const availablePlatforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'bandcamp'].filter(
    p => !existingPlatforms.has(p as any)
  );

  const hasYouTubeLinks = socials.some(s => s.platform === 'youtube');
  const hasInstagramLinks = socials.some(s => s.platform === 'instagram');
  const hasFacebookLinks = socials.some(s => s.platform === 'facebook');
  const hasBandcampLinks = socials.some(s => s.platform === 'bandcamp');
  const hasScrapableLinks = hasYouTubeLinks || hasInstagramLinks || hasFacebookLinks || hasBandcampLinks;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Social Media Links</h3>
        <div className="flex items-center gap-2">
          {hasScrapableLinks && (
            <button
              onClick={handleUpdateStats}
              disabled={isUpdatingStats}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title={`Update ${[
                hasYouTubeLinks && 'YouTube',
                hasInstagramLinks && 'Instagram',
                hasFacebookLinks && 'Facebook',
                hasBandcampLinks && 'Bandcamp'
              ].filter(Boolean).join(' & ')} stats`}
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingStats ? 'animate-spin' : ''}`} />
              {isUpdatingStats ? 'Updating...' : 'Update Stats'}
            </button>
          )}
          {user && availablePlatforms.length > 0 && (
            <button
              onClick={() => {
                if (!showAddForm) {
                  // When opening form, set platform to first available
                  setNewPlatform(availablePlatforms[0]);
                  setNewUrl('');
                  setError('');
                }
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {showAddForm ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Link
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && !showAddForm && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => {
                  setNewPlatform(e.target.value);
                  setNewUrl(''); // Clear URL when platform changes
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                {availablePlatforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Profile URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={newPlatform ? `https://www.${newPlatform}.com/...` : 'Enter profile URL'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAddSocial}
                disabled={addMutation.isPending}
                className="px-4 py-2 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading social links...</div>
      ) : socials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No social media links added yet</p>
          {user && (
            <p className="text-sm mt-2">Be the first to add {artistName}'s social media profiles!</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {socials.map((social) => {
            const Icon = platformIcons[social.platform] || ExternalLink;
            const colorClass = platformColors[social.platform] || 'text-gray-600';
            
            return (
              <div
                key={social.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                  <div>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      {social.handle || social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {social.platform !== 'bandcamp' && social.followerCount && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {parseInt(social.followerCount).toLocaleString()}
                          {social.platform === 'youtube' ? ' subscribers' : ' followers'}
                        </span>
                        {social.growthRate !== null && social.growthRate !== undefined && (
                          <span className={`font-medium ${
                            social.growthRate > 0 ? 'text-green-600' :
                            social.growthRate < 0 ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {social.growthRate > 0 ? '↑' : social.growthRate < 0 ? '↓' : '→'}
                            {Math.abs(social.growthRate).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                    {social.platform === 'bandcamp' && social.albumCount !== null && social.albumCount !== undefined && (
                      <div className="text-xs text-gray-500 font-medium">
                        🎵 {social.albumCount} {social.albumCount === 1 ? 'release' : 'releases'}
                      </div>
                    )}
                    {social.platform === 'bandcamp' && social.metrics && (
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        {social.metrics.labelName && (
                          <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                            🏷️ {social.metrics.labelName}
                          </span>
                        )}
                        {social.metrics.location && (
                          <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                            📍 {social.metrics.location}
                          </span>
                        )}
                      </div>
                    )}
                    {social.user && (
                      <p className="text-xs text-gray-500">
                        Added by {social.user.name || social.user.email.split('@')[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {social.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  
                  {user && !social.verified && (
                    <button
                      onClick={() => verifyMutation.mutate(social.id)}
                      className="text-xs text-blue-600 hover:underline"
                      title="Mark as verified"
                    >
                      Verify
                    </button>
                  )}
                  
                  {user && social.addedBy === user.id && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this link?')) {
                          deleteMutation.mutate(social.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!user && socials.length > 0 && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Sign in to add or verify social media links
        </p>
      )}
    </div>
  );
}