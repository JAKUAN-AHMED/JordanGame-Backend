
import { Model, Types } from 'mongoose';

// Photo type
export type TPhotoGallery = {
  imageUrl: string;
  file: Record<string, any>;
};

export type GENDER = 'Male' | 'Female';
export type MAJOR =
  | 'Elementary'
  | 'High School'
  | 'Undergraduate'
  | 'Graduate'
  | 'PhD'
  | 'MASTERS'
  | 'Other';

export type AgeRange = {
  min: number;
  max: number;
};

export type Country ={
  country: string;
}

export type FeatureTypes = 'free' | 'lomi' | 'premimum' | 'flower';

export type TUserProfile = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  firstName: string;
  lastName: string;
  Tphone: string;
  age: string;
  gender: GENDER;
  country: string; // typo? should be "country"
  city: string;
  aboutself: string;
  instName?: string;
  major?: MAJOR;
  jobTitle?: string;
  religion?: string;
  prefCountry: Country;
  prefAgeRange: AgeRange;
  prefGender: GENDER;
  profileImage?: string;
  isverified: boolean;
  featuereTypes:FeatureTypes
};

// Profile statics
export interface Profile extends Model<TUserProfile> {
  isExistProfileExistByUserId(userId: string): Promise<TUserProfile | null>;
}

// Country statics
export interface CountryModel extends Model<Country> {
  isCountryExist(id: string): Promise<Country | null>;
  isAlreadyCountryExist(id: string): Promise<Country | null>;
  isAlreadyCountryExistByName(name: string): Promise<Country | null>;
}
