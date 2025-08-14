import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // Try to get Supabase session token
  const supabaseToken = (await import('./supabase')).supabase.auth.getSession();
  const session = await supabaseToken;
  
  if (session.data.session?.access_token) {
    config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
  } else {
    // Fall back to old auth token if exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected routes, not for optional auth checks
      const url = error.config?.url || '';
      if (url.includes('/watchlist') || url.includes('/alerts')) {
        // Don't redirect for these, just return the error
        return Promise.reject(error);
      }
      localStorage.removeItem('auth_token');
      // Don't auto-redirect, let components handle auth state
    }
    return Promise.reject(error);
  }
);

export interface Artist {
  id: string;
  name: string;
  slug?: string | null;
  genres: string[];
  popularity: number | null;
  followers: number | null;
  country: string | null;
  isMajorLabel: boolean | null;
  imageUrl: string | null;
  spotifyUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  id: string;
  artistId: string;
  name: string;
  albumId: string | null;
  albumName: string | null;
  releaseDate: string | null;
  tempo: number | null;
  energy: number | null;
  danceability: number | null;
  valence: number | null;
  loudness: number | null;
  acousticness: number | null;
  instrumentalness: number | null;
  speechiness: number | null;
  duration: number | null;
}

export interface Snapshot {
  id: number;
  artistId: string;
  snapshotDate: string;
  popularity: number | null;
  followers: number | null;
  tiktokMentions: number | null;
  playlistCount: number | null;
}

export interface MomentumData {
  artistId: string;
  name: string;
  slug?: string | null;
  genres: string[];
  currentPopularity: number;
  currentFollowers: number;
  deltaPopularity: number;
  deltaFollowersPct: number;
  deltaTiktokPct: number;
  deltaInstagramPct: number;
  deltaYoutubePct: number;
  momentumScore: number;
  sparkline: number[];
}

export interface LeaderboardResponse {
  success: boolean;
  data: MomentumData[];
  meta: {
    genres: string[];
    days: number;
    limit: number;
    total: number;
  };
}

export interface ArtistDetailResponse {
  success: boolean;
  data: Artist & {
    tracks: Track[];
    snapshots: Snapshot[];
    momentum: MomentumData | null;
    audioProfile: {
      energy: number;
      danceability: number;
      valence: number;
      tempo: number;
      acousticness: number;
      instrumentalness: number;
    } | null;
  };
}

export const artistsApi = {
  getLeaderboard: async (genres: string[], days: number, limit = 50) => {
    const params = new URLSearchParams();
    if (genres.length > 0) params.append('genres', genres.join(','));
    params.append('days', days.toString());
    params.append('limit', limit.toString());
    
    const { data } = await api.get<LeaderboardResponse>(`/api/leaderboard?${params}`);
    return data;
  },

  getArtist: async (id: string) => {
    const { data } = await api.get<ArtistDetailResponse>(`/api/artists/${id}`);
    return data;
  },

  syncArtist: async (id: string) => {
    const { data } = await api.post(`/api/artists/sync/${id}`);
    return data;
  },

  getGenres: async (limit = 20) => {
    const { data } = await api.get(`/api/artists/genres/list?limit=${limit}`);
    return data;
  },
};

export const watchlistApi = {
  getWatchlist: async () => {
    const { data } = await api.get('/api/watchlist');
    return data;
  },

  addToWatchlist: async (artistId: string) => {
    const { data } = await api.post('/api/watchlist', { artistId });
    return data;
  },

  removeFromWatchlist: async (artistId: string) => {
    const { data } = await api.delete(`/api/watchlist/${artistId}`);
    return data;
  },
};

export const alertsApi = {
  getAlerts: async () => {
    const { data } = await api.get('/api/alerts');
    return data;
  },

  createAlert: async (artistId: string, threshold: number) => {
    const { data } = await api.post('/api/alerts', { artistId, threshold });
    return data;
  },

  updateAlert: async (id: number, updates: { threshold?: number; isActive?: boolean }) => {
    const { data } = await api.patch(`/api/alerts/${id}`, updates);
    return data;
  },

  deleteAlert: async (id: number) => {
    const { data } = await api.delete(`/api/alerts/${id}`);
    return data;
  },
};

export const authApi = {
  register: async (email: string, name?: string) => {
    const { data } = await api.post('/api/auth/register', { email, name });
    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
    }
    return data;
  },

  login: async (email: string) => {
    const { data } = await api.post('/api/auth/login', { email });
    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
    }
    return data;
  },

  verify: async () => {
    const { data } = await api.post('/api/auth/verify');
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  },
};

export interface ArtistSocial {
  id: string;
  artistId: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'facebook';
  handle?: string;
  url: string;
  channelId?: string;
  verified: boolean;
  addedBy?: string;
  addedAt: string;
  updatedAt: string;
  followerCount?: string;
  lastFetched?: string;
  growthRate?: number | null;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export const socialsApi = {
  getArtistSocials: async (artistId: string) => {
    const { data } = await api.get<{ success: boolean; data: ArtistSocial[] }>(
      `/api/socials/artist/${artistId}`
    );
    return data;
  },

  addSocial: async (artistId: string, platform: string, url: string) => {
    const { data } = await api.post<{ success: boolean; data: ArtistSocial; message: string }>(
      '/api/socials',
      { artistId, platform, url }
    );
    return data;
  },

  updateSocial: async (id: string, updates: { verified?: boolean }) => {
    const { data } = await api.patch<{ success: boolean; data: ArtistSocial }>(
      `/api/socials/${id}`,
      updates
    );
    return data;
  },

  deleteSocial: async (id: string) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/socials/${id}`
    );
    return data;
  },
};

// Comments API
export interface Comment {
  id: string;
  artistId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  replies?: Comment[];
}

export const commentsApi = {
  getArtistComments: async (artistId: string, page = 1, limit = 20) => {
    const { data } = await api.get<{
      data: Comment[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/comments/artist/${artistId}`, {
      params: { page, limit },
    });
    return data;
  },

  createComment: async (artistId: string, content: string, parentId?: string) => {
    const { data } = await api.post<{ data: Comment }>('/api/comments', {
      artistId,
      content,
      parentId,
    });
    return data;
  },

  updateComment: async (id: string, content: string) => {
    const { data } = await api.put<{ data: Comment }>(`/api/comments/${id}`, {
      content,
    });
    return data;
  },

  deleteComment: async (id: string) => {
    const { data } = await api.delete<{ success: boolean }>(`/api/comments/${id}`);
    return data;
  },
};

// Ratings API
export interface Rating {
  id: string;
  artistId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export const ratingsApi = {
  getArtistRatings: async (artistId: string, page = 1, limit = 20) => {
    const { data } = await api.get<{
      data: Rating[];
      stats: RatingStats;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/ratings/artist/${artistId}`, {
      params: { page, limit },
    });
    return data;
  },

  getUserRating: async (artistId: string) => {
    const { data } = await api.get<{ data: Rating | null }>(
      `/api/ratings/artist/${artistId}/user`
    );
    return data;
  },

  createOrUpdateRating: async (artistId: string, rating: number, review?: string) => {
    const { data } = await api.post<{ data: Rating }>('/api/ratings', {
      artistId,
      rating,
      review,
    });
    return data;
  },

  deleteRating: async (artistId: string) => {
    const { data } = await api.delete<{ success: boolean }>(
      `/api/ratings/artist/${artistId}`
    );
    return data;
  },

  getTopRated: async (limit = 10) => {
    const { data } = await api.get<{
      data: Array<{
        artist: {
          id: string;
          name: string;
          imageUrl: string | null;
          genres: string[];
        };
        averageRating: number;
        totalRatings: number;
      }>;
    }>('/api/ratings/top-rated', {
      params: { limit },
    });
    return data;
  },
};

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  twitter: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  website: string | null;
  isPublic?: boolean;
  showActivity?: boolean;
  showWatchlist?: boolean;
  allowFollowers?: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    watchlists: number;
    comments: number;
    ratings: number;
    followers?: number;
    following?: number;
  };
}

export interface UserActivity {
  comments: Array<Comment & {
    artist: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
    parent?: {
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    } | null;
  }>;
  ratings: Array<Rating & {
    artist: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  }>;
}

export const profileApi = {
  getMyProfile: async () => {
    const { data } = await api.get<{ data: UserProfile }>('/api/profile/me');
    return data;
  },

  getUserProfile: async (userId: string) => {
    const { data } = await api.get<{ 
      data: UserProfile;
      isFollowing: boolean;
      isOwner: boolean;
    }>(`/api/profile/user/${userId}`);
    return data;
  },

  updateMyProfile: async (updates: Partial<UserProfile>) => {
    const { data } = await api.put<{ data: UserProfile }>('/api/profile/me', updates);
    return data;
  },

  getUserActivity: async (userId: string, page = 1, limit = 20) => {
    const { data } = await api.get<{
      data: UserActivity;
      pagination: {
        page: number;
        limit: number;
        commentsTotal: number;
        ratingsTotal: number;
      };
    }>(`/api/profile/activity/${userId}`, {
      params: { page, limit },
    });
    return data;
  },

  getUserWatchlist: async (userId: string) => {
    const { data } = await api.get<{
      data: Array<{
        id: string;
        name: string;
        imageUrl: string | null;
        genres: string[];
        followers: number | null;
        popularity: number | null;
      }>;
    }>(`/api/profile/watchlist/${userId}`);
    return data;
  },
};

// Follow API
export interface FollowStatus {
  status: 'none' | 'following' | 'requested';
}

export interface FollowCounts {
  followers: number;
  following: number;
}

export const followApi = {
  getFollowStatus: async (userId: string) => {
    const { data } = await api.get<{ status: string }>(`/api/follows/status/${userId}`);
    return data;
  },

  followUser: async (userId: string) => {
    const { data } = await api.post(`/api/follows/follow/${userId}`);
    return data;
  },

  unfollowUser: async (userId: string) => {
    const { data } = await api.delete(`/api/follows/unfollow/${userId}`);
    return data;
  },

  cancelRequest: async (userId: string) => {
    const { data } = await api.delete(`/api/follows/requests/${userId}`);
    return data;
  },

  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const { data } = await api.get(`/api/follows/followers/${userId}`, {
      params: { page, limit },
    });
    return data;
  },

  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const { data } = await api.get(`/api/follows/following/${userId}`, {
      params: { page, limit },
    });
    return data;
  },

  getFollowCounts: async (userId: string) => {
    const { data } = await api.get<FollowCounts>(`/api/follows/counts/${userId}`);
    return data;
  },

  getFollowRequests: async (page = 1, limit = 20) => {
    const { data } = await api.get('/api/follows/requests', {
      params: { page, limit },
    });
    return data;
  },

  approveRequest: async (requestId: string) => {
    const { data } = await api.post(`/api/follows/requests/${requestId}/approve`);
    return data;
  },

  rejectRequest: async (requestId: string) => {
    const { data } = await api.post(`/api/follows/requests/${requestId}/reject`);
    return data;
  },
};