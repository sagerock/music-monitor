'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi, RatingStats } from '@/lib/api';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { formatDistanceToNow } from 'date-fns';
import { ClickableUsername } from '@/components/clickable-username';

interface RatingPanelProps {
  artistId: string;
  artistName: string;
}

export function RatingPanel({ artistId, artistName }: RatingPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviews, setShowReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: ratingsData } = useQuery({
    queryKey: ['ratings', artistId],
    queryFn: () => ratingsApi.getArtistRatings(artistId),
  });

  const { data: userRatingData } = useQuery({
    queryKey: ['user-rating', artistId],
    queryFn: () => ratingsApi.getUserRating(artistId),
    enabled: !!user,
  });

  const submitRatingMutation = useMutation({
    mutationFn: () => ratingsApi.createOrUpdateRating(artistId, userRating, userReview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', artistId] });
      queryClient.invalidateQueries({ queryKey: ['user-rating', artistId] });
      setShowReviewForm(false);
      setUserRating(0);
      setUserReview('');
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: () => ratingsApi.deleteRating(artistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', artistId] });
      queryClient.invalidateQueries({ queryKey: ['user-rating', artistId] });
    },
  });

  const stats = ratingsData?.stats || {
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  const ratings = ratingsData?.data || [];
  const existingRating = userRatingData?.data;

  const handleSubmitRating = () => {
    if (userRating > 0) {
      submitRatingMutation.mutate();
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setUserRating(star)}
            disabled={!interactive}
            className={interactive ? 'hover:scale-110 transition-transform' : ''}
          >
            <Star
              className={`${size} ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const maxCount = Math.max(...Object.values(stats.distribution));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Ratings & Reviews</h3>

      {/* Rating Stats */}
      <div className="flex items-start gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold">{stats.average.toFixed(1)}</div>
          {renderStars(Math.round(stats.average))}
          <p className="text-sm text-gray-500 mt-1">{stats.total} ratings</p>
        </div>

        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-1">
              <span className="text-sm w-4">{rating}</span>
              <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 rounded-full h-2 transition-all"
                  style={{
                    width: `${
                      maxCount > 0 ? (stats.distribution[rating] / maxCount) * 100 : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">
                {stats.distribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* User Rating Section */}
      {user && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          {existingRating ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your rating</p>
                  {renderStars(existingRating.rating)}
                  {existingRating.review && (
                    <p className="mt-2 text-sm">{existingRating.review}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteRatingMutation.mutate()}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full py-2 px-4 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Rate {artistName}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your rating</p>
                    {renderStars(userRating, true, 'w-8 h-8')}
                  </div>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your thoughts (optional)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitRating}
                      disabled={userRating === 0 || submitRatingMutation.isPending}
                      className="px-4 py-2 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false);
                        setUserRating(0);
                        setUserReview('');
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reviews Section */}
      {ratings.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="flex items-center gap-2 text-sm font-medium hover:text-spotify-green transition-colors"
          >
            {showReviews ? 'Hide' : 'Show'} Reviews ({ratings.length})
            {showReviews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReviews && (
            <div className="mt-4 space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <ClickableUsername 
                          user={rating.user} 
                          className="font-medium text-sm"
                        />
                        {renderStars(rating.rating, false, 'w-4 h-4')}
                      </div>
                      {rating.review && <p className="text-sm mt-1">{rating.review}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!user && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Sign in to rate and review artists
        </p>
      )}
    </div>
  );
}