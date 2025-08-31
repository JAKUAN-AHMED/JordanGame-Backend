import { Types } from 'mongoose';
import { TUserProfile, Country } from './profile.interface';
import AppError from '../../errors/AppError';
import { CountryMODEL, ProfileModel } from './profile.model';
import { User } from '../user/user.model';
import { AlreadyExist, NotFound } from '../../utils/utils';

const SetUpProfile = async (payload: TUserProfile) => {
  const { user, firstName, lastName, Tphone, age, prefCountry } = payload;

  console.log('SetUpProfile payload:', payload);
  if (!user || !firstName || !lastName || !Tphone || !age ||!prefCountry) {
    throw new AppError(404, 'Required fields are missing');
  }

  const isUserExist = await User.isExistUserById(
    (user as Types.ObjectId).toString()
  );
  if (!isUserExist) {
    throw new AppError(404, 'User does not exist');
  }

  const isProfileExist = await ProfileModel.isExistProfileExistByUserId(
    (user as Types.ObjectId).toString()
  );
  if (isProfileExist) {
    throw new AppError(409, 'Profile already exists');
  }

  // ✅ Validate prefCountry against CountryMODEL

 // ✅ Validate prefCountry if provided
  if (prefCountry && prefCountry.country) {
    const countryName = String(prefCountry.country).trim();

    const isCountryExist = await CountryMODEL.findOne({
      country: { $regex: new RegExp(`^${countryName}$`, 'i') },
    });

    if (!isCountryExist) {
      throw new AppError(404, `Country ${countryName} not found`);
    }
  }

  const result = await ProfileModel.create(payload);
  if (!result) {
    throw new Error('Profile creation failed');
  }

  await User.findByIdAndUpdate(
    (user as Types.ObjectId).toString(),
    { profile: result._id },
    { new: true }
  );

  return result;
};

const updateProfile = async (payload: Partial<TUserProfile>) => {
  if (!payload.user) {
    throw new AppError(400, 'User ID is required for profile update');
  }

  const profile = await ProfileModel.findOne({ user: payload.user });
  if (!profile) {
    throw new AppError(404, 'Profile not found for this user');
  }

  const updatedProfile = await ProfileModel.findByIdAndUpdate(
    profile._id,
    { $set: { ...payload } },
    { new: true, runValidators: true }
  );

  if (!updatedProfile) {
    throw new AppError(500, 'Profile update failed');
  }

  return updatedProfile;
};

// verify profile
const uploadImageForVerification = async (img: string, img2: string) => {
  return { images: { img, img2 } };
};

const VerifyProfile = async (id: string, value: boolean) => {
  return await ProfileModel.findByIdAndUpdate(
    id,
    { $set: { isverified: value } },
    { new: true, runValidators: true }
  );
};

// create country
const createCountry = async (payload: Country) => {
  const isExist = await CountryMODEL.isAlreadyCountryExistByName(payload.country);
  await AlreadyExist(isExist);
  return await CountryMODEL.create(payload);
};

const getCountry = async () => {
  return await CountryMODEL.find();
};

const singleCountry = async (id: string) => {
  const isExist = await CountryMODEL.isCountryExist(id);
  await NotFound(isExist, 'Country Not Found');
  return isExist;
};

const deleteCountry = async (id: string) => {
  const isExist = await CountryMODEL.isCountryExist(id);
  await NotFound(isExist, 'Country Not Found');
  return await CountryMODEL.findByIdAndDelete(id);
};

const updateCountry = async (id: string, payload: Country) => {
  const isExist = await CountryMODEL.isCountryExist(id);
  await NotFound(isExist, 'Country Not Found');
  return await CountryMODEL.findByIdAndUpdate(
    id,
    { $set: { country: payload.country } },
    { new: true, runValidators: true }
  );
};

export const ProfileServices = {
  SetUpProfile,
  updateProfile,
  uploadImageForVerification,
  VerifyProfile,
  createCountry,
  updateCountry,
  deleteCountry,
  getCountry,
  singleCountry,
};
