import axiosInstance from "@/lib/axios";

export interface UpdateRoleRequest {
  role: 'user' | 'store' | 'super_user';
}

export interface UserRoleResponse {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface UploadAvatarResponse {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimetype: string;
}

export const UserService = {
  // Update user role
  async updateUserRole(userId: string, role: UpdateRoleRequest['role']): Promise<UserRoleResponse> {
    const response = await axiosInstance.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const response = await axiosInstance.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user statistics (for admin users)
  async getUserStatistics(): Promise<any> {
    const response = await axiosInstance.get('/users/statistics');
    return response.data;
  },

  // Search users (for admin users)
  async searchUsers(searchParams: any): Promise<any> {
    const response = await axiosInstance.post('/users/search', searchParams);
    return response.data;
  },
};
