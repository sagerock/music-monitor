'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserMinus, Clock, UserCheck } from 'lucide-react';
import { followApi, FollowStatus } from '@/lib/api';

interface FollowButtonProps {
  userId: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
}


export function FollowButton({ 
  userId, 
  disabled = false, 
  size = 'md', 
  variant = 'default' 
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  // Get current follow status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['followStatus', userId],
    queryFn: () => followApi.getFollowStatus(userId),
    retry: 1,
  });

  const followStatus = statusData?.status || 'none';

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (followStatus === 'following') {
        return followApi.unfollowUser(userId);
      } else if (followStatus === 'requested') {
        return followApi.cancelRequest(userId);
      } else {
        return followApi.followUser(userId);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh status
      queryClient.invalidateQueries({ queryKey: ['followStatus', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const handleClick = () => {
    if (!disabled && !followMutation.isPending) {
      followMutation.mutate();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Icon size classes
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Base button classes
  const baseClasses = `
    inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
  `;

  // Get button content based on status
  const getButtonContent = () => {
    if (isLoading || followMutation.isPending) {
      return {
        icon: <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`} />,
        text: 'Loading...',
        classes: 'bg-gray-200 text-gray-600 cursor-not-allowed',
      };
    }

    switch (followStatus) {
      case 'following':
        return {
          icon: isHovered ? <UserMinus className={iconSizes[size]} /> : <UserCheck className={iconSizes[size]} />,
          text: isHovered ? 'Unfollow' : 'Following',
          classes: isHovered 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-green-500 text-white hover:bg-green-600',
        };
      
      case 'requested':
        return {
          icon: <Clock className={iconSizes[size]} />,
          text: isHovered ? 'Cancel Request' : 'Requested',
          classes: isHovered 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-yellow-500 text-white hover:bg-yellow-600',
        };
      
      default:
        return {
          icon: <UserPlus className={iconSizes[size]} />,
          text: 'Follow',
          classes: variant === 'outline' 
            ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
            : 'bg-spotify-green text-white hover:bg-green-600',
        };
    }
  };

  const { icon, text, classes } = getButtonContent();

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || followMutation.isPending}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${classes}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}