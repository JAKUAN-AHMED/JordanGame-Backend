
import { Model, Types } from 'mongoose';

// Photo type
export type TPhotoGallery = {
  imageUrl: string;
  file: Record<string, any>;
};

export type GENDER = 'Male' | 'Female' | 'Other';
export type TUserProfile = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  gender: GENDER;
  address: string;
  country:string;
  phone: string;
  avatar?:string;
};

// Profile statics
export interface Profile extends Model<TUserProfile> {
  isExistProfileExistByUserId(userId: string): Promise<TUserProfile | null>;
}


