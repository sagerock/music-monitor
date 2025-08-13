'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/api';
import { Calendar, MessageCircle, Star, Heart, Globe, Twitter, Instagram, Youtube, Users, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FaTiktok } from 'react-icons/fa';
import { FollowersList } from '@/components/followers-list';
import { FollowingList } from '@/components/following-list';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const displayName = profile.name || profile.email.split('@')[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-spotify-green to-green-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {displayName[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
            {profile.name && (
              <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.email.split('@')[0]}</p>
            )}
          </div>

          {profile.bio && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm">
            {profile._count && (
              <>
                {/* Followers and Following (clickable) */}
                {typeof profile._count.followers === 'number' && (
                  <button
                    onClick={() => setShowFollowers(true)}
                    className="flex items-center gap-1 hover:text-spotify-green transition-colors"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{profile._count.followers}</span>
                    <span className="text-gray-500">Followers</span>
                  </button>
                )}
                {typeof profile._count.following === 'number' && (
                  <button
                    onClick={() => setShowFollowing(true)}
                    className="flex items-center gap-1 hover:text-spotify-green transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{profile._count.following}</span>
                    <span className="text-gray-500">Following</span>
                  </button>
                )}
                
                {/* Other Stats */}
                {typeof profile._count.watchlists === 'number' && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{profile._count.watchlists}</span>
                    <span className="text-gray-500">Artists</span>
                  </div>
                )}
                {typeof profile._count.comments === 'number' && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{profile._count.comments}</span>
                    <span className="text-gray-500">Comments</span>
                  </div>
                )}
                {typeof profile._count.ratings === 'number' && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{profile._count.ratings}</span>
                    <span className="text-gray-500">Ratings</span>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">
                Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-spotify-green transition-colors"
                title="Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {profile.twitter && (
              <a
                href={`https://twitter.com/${profile.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-400 transition-colors"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-500 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {profile.tiktok && (
              <a
                href={`https://tiktok.com/@${profile.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                title="TikTok"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
            )}
            {profile.youtube && (
              <a
                href={`https://youtube.com/@${profile.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-500 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FollowersList 
        userId={profile.id} 
        isOpen={showFollowers} 
        onClose={() => setShowFollowers(false)} 
      />
      <FollowingList 
        userId={profile.id} 
        isOpen={showFollowing} 
        onClose={() => setShowFollowing(false)} 
      />
    </div>
  );
}