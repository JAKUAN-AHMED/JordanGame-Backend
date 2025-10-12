import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { isUserDeleted, NotFound, validateUserStatus } from '../../utils/utils';
import { TUserStatus, UserStatus } from './user.constant';



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

const UpdateProfile = async (userId: string,payload:Partial<TUser>)=> {
  const result = await User.findById(userId, '-password');
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: payload },
    { new: true, runValidators: true, select: '-password' }
  )
  return updatedUser;
};

const updateUserStatus = async (
  userId: string,
  profileStatus:TUserStatus
)=> {
  if (!profileStatus) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Profile status payload is required');
  }

  // Validate status value
  
  if (!UserStatus.includes(profileStatus)) {
    throw new AppError(StatusCodes.BAD_REQUEST, `Invalid status. Must be one of: ${UserStatus.join(', ')}`);
  }

  // Update user directly
  const result = await User.findByIdAndUpdate(
    userId,
    { $set: { profileStatus: profileStatus } },
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


  const filters: Record<string, any> = {
    isEmailVerified: true
  };
  if (query.searchTerm) {
    filters.$or = [
      { fullName: { $regex: query.searchTerm, $options: 'i' } },
      { email: { $regex: query.searchTerm, $options: 'i' } },
    ];
  }
  const users = await User.find(filters)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filters);
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

  // Check if user is suspended or blocked - they cannot change their status
  if (user.profileStatus === 'suspend') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Your account is suspended. Please contact support to reactivate your account.'
    );
  }

  if (user.profileStatus === 'block') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Your account is blocked. Please contact support to unblock your account.'
    );
  }

  if (user.profileStatus === 'delete') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'Your account is marked for deletion. Please contact support to recover your account.'
    );
  }

  // User can only toggle between 'active' and 'disabled'
  const newStatus = isDeactivated ? 'disabled' : 'active';

  return await User.findByIdAndUpdate(
    userId,
    { $set: { profileStatus: newStatus } },
    { new: true, runValidators: true, select: '-password' }
  );
};



export const UserService = {
  createAdminOrSuperAdmin,
  getAllUsers,
  getSingleUser,
  UpdateProfile,
  updateUserStatus,
  getMyProfile,
  deleteMyProfile,
  recoverAccount,
  ActivateDeactivateAccount
};
