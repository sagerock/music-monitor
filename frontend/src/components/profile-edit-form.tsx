'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserProfile, profileApi } from '@/lib/api';
import { Save, X, Shield, Eye, EyeOff, Users, GraduationCap, FileText, Upload, Trash2, Lock, Key } from 'lucide-react';
import { AvatarUpload } from '@/components/avatar-upload';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProfileEditFormProps {
  profile: UserProfile;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
    school: profile.school || '',
    graduationYear: profile.graduationYear || null,
    major: profile.major || '',
    resumeUrl: profile.resumeUrl || '',
    linkedin: profile.linkedin || '',
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

  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChange = (field: string, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && value === '' ? null : value,
    }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for resumes');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume file must be less than 10MB');
      return;
    }

    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormData(prev => ({ ...prev, resumeUrl: response.data.data.resumeUrl }));
        toast.success('Resume uploaded successfully');
      }
    } catch (error: any) {
      console.error('Resume upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;

    try {
      const response = await api.delete('/api/upload/resume');
      if (response.data.success) {
        setFormData(prev => ({ ...prev, resumeUrl: '' }));
        toast.success('Resume deleted successfully');
      }
    } catch (error: any) {
      console.error('Resume delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete resume');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
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

        {/* Professional/Student Info */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Professional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">School/University</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleChange('school', e.target.value)}
                placeholder="e.g., Berklee College of Music"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Major/Program</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  placeholder="e.g., Music Business"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduationYear || ''}
                  onChange={(e) => handleChange('graduationYear', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="2025"
                  min="2000"
                  max="2040"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume (PDF)
              </label>

              {formData.resumeUrl ? (
                <div className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <FileText className="w-8 h-8 text-spotify-green" />
                  <div className="flex-1">
                    <div className="font-medium">Resume uploaded</div>
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-spotify-green hover:underline"
                    >
                      View Resume
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleResumeDelete}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-spotify-green transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={isUploadingResume}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isUploadingResume ? 'Uploading...' : 'Click to upload resume (PDF, max 10MB)'}
                    </p>
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Your resume will be visible to employers viewing your profile
              </p>
            </div>
          </div>
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

        {/* Change Password */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold">Change Password</h3>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Key className="w-4 h-4" />
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
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