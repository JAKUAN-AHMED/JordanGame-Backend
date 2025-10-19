import { Model, Types } from 'mongoose';
import { Role } from '../../middlewares/roles';
import { PaginateResult as IPaginationResult, PaginateOptions as IPaginationOptions } from '../../types/paginate';
import { TUserStatus } from './user.constant';




export type TUser = {
  _id: Types.ObjectId;
  email: string;
  password: string;
  phone: string;
  fullName: string; 
  address: string;
  isHePlayedFirstTime?: boolean;
  isHeBroughtFirstTime?: boolean;
  CurrentGametag: string;
  profileImage: string;
  totalCarrots?: number;
  role: Role;
  profileStatus: TUserStatus;
  lastLoginAt: Date;
  isEmailVerified: boolean;
  lastPasswordChange: Date;
  isResetPassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
};

export interface UserModal extends Model<TUser> {
  paginate: (
    filter: object,
    options: IPaginationOptions
  ) => Promise<IPaginationResult<TUser>>;
  isExistUserById(id: string): Promise<Partial<TUser> | null>;
  isUserDeletedById(id: string): Promise<boolean>;
  isExistUserByEmail(email: string): Promise<Partial<TUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
