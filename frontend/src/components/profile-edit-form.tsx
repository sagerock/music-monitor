'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserProfile, profileApi } from '@/lib/api';
import { Save, X, Shield, Eye, EyeOff, Users } from 'lucide-react';
import { AvatarUpload } from '@/components/avatar-upload';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
    twitter: profile.twitter || '',
    instagram: profile.instagram || '',
    tiktok: profile.tiktok || '',
    youtube: profile.youtube || '',
    website: profile.website || '',
    isPublic: profile.isPublic ?? true,
    showActivity: profile.showActivity ?? true,
    showWatchlist: profile.showWatchlist ?? true,
    allowFollowers: profile.allowFollowers ?? true,
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      // Filter out empty strings and convert them to null
      const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {} as any);
      return profileApi.updateMyProfile(cleanedData);
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && value === '' ? null : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Profile Picture</label>
          <AvatarUpload 
            currentAvatarUrl={formData.avatarUrl}
            onUploadSuccess={(avatarUrl) => {
              // Silently update form data - no other actions
              setFormData(prev => ({ ...prev, avatarUrl }));
            }}
            onDeleteSuccess={() => {
              // Silently update form data - no other actions  
              setFormData(prev => ({ ...prev, avatarUrl: '' }));
            }}
            size="md"
          />
          <p className="text-xs text-gray-500 mt-2">
            Avatar uploads are saved automatically
          </p>
        </div>

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your display name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
        </div>


        {/* Social Media */}
        <div>
          <h3 className="text-lg font-medium mb-4">Social Media</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                  @
                </span>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-900"
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                  @
                </span>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-900"
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">TikTok</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                  @
                </span>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => handleChange('tiktok', e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-900"
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg">
                  @
                </span>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => handleChange('youtube', e.target.value.replace('@', ''))}
                  placeholder="channel"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-900"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Public Profile</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Allow anyone to view your profile and activity
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Allow Followers</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Let other users follow your profile
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowFollowers}
                  onChange={(e) => handleChange('allowFollowers', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Show Activity</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Display your comments and ratings on your profile
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showActivity}
                  onChange={(e) => handleChange('showActivity', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Show Watchlist</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Display your watchlist on your profile
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showWatchlist}
                  onChange={(e) => handleChange('showWatchlist', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        {updateMutation.isError && (
          <p className="text-red-600 text-sm">Failed to update profile. Please try again.</p>
        )}
      </div>
    </form>
  );
}