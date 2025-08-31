import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Types } from 'mongoose';
import { TokenService } from '../token/token.service';
import { OtpService } from '../otp/otp.service';
import { NotFound } from '../../utils/utils';



const createAdminOrSuperAdmin = async (payload: TUser) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'This email already exists');
  }
  const result = new User({
    ...payload,
    first_name: 'New',
    last_name: ` ${payload.role === 'admin' ? 'Admin' : 'Super Admin'}`,
    email: payload.email,
    password: payload.password,
    role: payload.role,
  });

  await result.save();

  //create verification email token
  const verificationToken = await TokenService.createVerifyEmailToken(result);
  //create verification email otp
  await OtpService.createVerificationEmailOtp(result?.email);
  return { verificationToken };
};

const getSingleUser = async (userId: string): Promise<TUser | null> => {
  const result = await User.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(userId),
        'status.isDeleted': false,
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'user',
        as: 'profile',
      },
    },
    { $unwind: '$profile' },
    { $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$profile'] } } },
    { $project: { profile: 0 } }, // removed profile field
  ]);
  return result[0];
};



const getMyProfile = async (userId: string): Promise<TUser | null> => {
  const result = await User.findById(userId);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result;
};
const deleteMyProfile = async (userId: string): Promise<TUser | null> => {
  const result = await User.findById(userId);

  await NotFound(result, 'User Not Found');
  const res = await User.findByIdAndDelete(
    userId
  );

  return res;
};

const getAllUsers = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.aggregate([
    {
      $match: {
        'status.isDeleted': false,
      },
    },
    {
      $lookup: {
        from: 'profiles', // collection name
        localField: '_id',
        foreignField: 'user',
        as: 'profile',
      },
    },
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        profileId: '$profile._id',   // keep profile _id separately
        user: '$_id',                // keep original user _id
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ['$$ROOT', '$profile'] },
      },
    },
    { $project: { _id: 0, profile: 0 } }, // remove nested profile field
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await User.countDocuments({ 'status.isDeleted': false });
  const totalPage = Math.ceil(total / limit);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};




export const UserService = {
  createAdminOrSuperAdmin,
  getAllUsers,
  getSingleUser,
  getMyProfile,
  deleteMyProfile,
};
