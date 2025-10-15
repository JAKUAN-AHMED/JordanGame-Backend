export type Role = 'admin' | 'user';

export type TUserStatus = 'active' | 'delete' | 'block'| 'suspend' | 'inactive' | 'disabled';

export const UserStatus: TUserStatus[] = ['active', 'block', 'delete', 'suspend', 'inactive', 'disabled'];

export type TGender = 'male' | 'female' | 'transgender' | 'other';

export const Gender: TGender[] = ['male', 'female', 'transgender', 'other'];







