import { Model, Types } from 'mongoose';
import { Role } from '../../middlewares/roles';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

export type TProfileImage = {
  imageUrl: string;
  // file: Record<string, any>;
};


export type TUser = {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  confirmpassword?: string;
  phone:string;
  role: Role;
  isEmailVerified: boolean;
  lastPasswordChange: Date;
  isResetPassword: boolean;
  failedLoginAttempts: number;
  lockUntil: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  profileId?:Types.ObjectId | null;

 //social login fields
  provider?: "google" | "facebook" | "local";
  providerId?: string;
  fname?: string;
};





export interface UserModal extends Model<TUser> {
  paginate: (
    filter: object,
    options: PaginateOptions
  ) => Promise<PaginateResult<TUser>>;
  isExistUserById(id: string): Promise<Partial<TUser> | null>;
  isUserDeletedById(id:string):Promise<boolean>;
  isExistUserByEmail(email: string): Promise<Partial<TUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}

