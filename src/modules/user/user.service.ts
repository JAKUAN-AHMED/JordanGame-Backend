import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Types } from 'mongoose';

// import { ProfileModel } from '../profile/profile.model';
import { isUserDeleted, NotFound, validateUserStatus } from '../../utils/utils';



const createAdminOrSuperAdmin = async (email: string) => {
  const existingUser = await User.findOne({ email });
 if(!existingUser){
    throw new AppError(404,'User not Found for this Email')
 }

 //update the existing admin
 await User.findOneAndUpdate({
  role:"admin"
 },{
  $set:{
    role:"user"
  }
 },{
  new:true,
  runValidators:true
 })


 //making admin
 await User.findOneAndUpdate({
  email
 },{
  $set:{
    role:"admin"
  }
 },{
  new:true,
  runValidators:true
 })
 
};
const getSingleUser = async (userId: string): Promise<TUser | null> => {
  const result = await User.findById(userId, '-password');
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return result;
};

const updateUserStatus = async (
  userId: string,
  payload: { status: string }
): Promise<any> => {
  if (!payload.status) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Status payload is required');
  }

  // Validate status value
  const validStatuses = ['active', 'inactive', 'block', 'delete', 'suspend', 'disabled'];
  if (!validStatuses.includes(payload.status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Update user directly
  const result = await User.findByIdAndUpdate(
    userId,
    { $set: { status: payload.status } },
    { new: true, select: '-password' }
  );

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result;
};

const getMyProfile = async (userId: string): Promise<TUser | null> => {
  const result = await User.findById(userId, '-password');

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result;
};
const deleteMyProfile = async (userId: string): Promise<any> => {
  const user = await User.findById(userId);
  await NotFound(user, 'User Not Found');

  const res = await User.findByIdAndDelete(userId);

  return res;
};

const getAllUsers = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({ isEmailVerified: true })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ isEmailVerified: true });
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


const recoverAccount = async (email: string) => {
  const user = await User.isExistUserByEmail(email);

  if (!user) {
    throw new AppError(404, 'User not found with this email');
  }

  // User account is already active if email is verified
  return user;
};

const ActivateDeactivateAccount = async (
  userId: string,
  isDeactivated: boolean
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return await User.findByIdAndUpdate(
    userId,
    { $set: { isEmailVerified: !isDeactivated } },
    { new: true, runValidators: true, select: '-password' }
  );
};



export const UserService = {
  createAdminOrSuperAdmin,
  getAllUsers,
  getSingleUser,
  updateUserStatus,
  getMyProfile,
  deleteMyProfile,
  recoverAccount,
  ActivateDeactivateAccount
};
