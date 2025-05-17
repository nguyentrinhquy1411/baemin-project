export interface UserProfileResponse {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

export function mapToLoginResponse(user: any, accessToken: string, refreshToken: string): LoginResponse {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      ...(user.user_profiles && {
        first_name: user.user_profiles.first_name,
        last_name: user.user_profiles.last_name,
        phone: user.user_profiles.phone,
        address: user.user_profiles.address,
      }),
    }
  };
}