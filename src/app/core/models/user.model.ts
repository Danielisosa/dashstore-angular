export type UserRole = 'user' | 'admin';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  address?: Address;
  isActive: boolean;
  roles: UserRole[];
}

export interface UpdateUserProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  address?: Address;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
