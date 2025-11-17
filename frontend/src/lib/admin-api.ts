import { api } from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  statusReason: string | null;
  statusChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    comments: number;
    ratings: number;
    watchlists: number;
  };
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
  };
  content: {
    comments: number;
    ratings: number;
    artists: number;
  };
}

export const adminApi = {
  // Get all users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'USER' | 'MODERATOR' | 'ADMIN';
    status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const { data } = await api.get<{
      success: boolean;
      data: AdminUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/admin/users?${queryParams}`);
    return data;
  },

  // Get single user
  getUser: async (userId: string) => {
    const { data } = await api.get<{ success: boolean; data: any }>(
      `/api/admin/users/${userId}`
    );
    return data;
  },

  // Update user role
  updateUserRole: async (userId: string, role: 'USER' | 'MODERATOR' | 'ADMIN') => {
    const { data } = await api.patch<{ success: boolean; data: any; message: string }>(
      `/api/admin/users/${userId}/role`,
      { role }
    );
    return data;
  },

  // Suspend user
  suspendUser: async (userId: string, reason?: string) => {
    const { data } = await api.post<{ success: boolean; data: any; message: string }>(
      `/api/admin/users/${userId}/suspend`,
      { reason }
    );
    return data;
  },

  // Ban user
  banUser: async (userId: string, reason?: string) => {
    const { data } = await api.post<{ success: boolean; data: any; message: string }>(
      `/api/admin/users/${userId}/ban`,
      { reason }
    );
    return data;
  },

  // Activate user (unsuspend/unban)
  activateUser: async (userId: string) => {
    const { data } = await api.post<{ success: boolean; data: any; message: string }>(
      `/api/admin/users/${userId}/activate`
    );
    return data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}`
    );
    return data;
  },

  // Delete comment
  deleteComment: async (commentId: string) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/admin/comments/${commentId}`
    );
    return data;
  },

  // Delete rating
  deleteRating: async (ratingId: string) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/admin/ratings/${ratingId}`
    );
    return data;
  },

  // Get platform stats
  getStats: async () => {
    const { data } = await api.get<{ success: boolean; data: AdminStats }>(
      '/api/admin/stats'
    );
    return data;
  },
};
