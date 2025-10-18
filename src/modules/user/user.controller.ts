import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import AppError from '../../errors/AppError';
import { UserService } from './user.service';
import { TokenService } from '../token/token.service';
import { TUser } from './user.interface';


const createAdminOrSuperAdmin = catchAsync(async (req, res) => {

  const result = await UserService.createAdminOrSuperAdmin(req.body.email);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    data: result,
    message: "Admin Created Succesfully"
  });
});

//get all users from database

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Users fetched successfully',
  });
});

//get single user from database
const getSingleUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await UserService.getSingleUser(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result ? result : [],
    message: 'User fetched successfully',
  });
});
//update user profile
const UpdateProfile = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.userId;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are unauthenticated.');
  }
  const result = await UserService.UpdateProfile(userId, req.body);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result ? result : [],
    message: 'Profile updated successfully',
  });
});


//get my profile
const getMyProfile = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.userId;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are unauthenticated.');
  }
  const result = await UserService.getMyProfile(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'User fetched successfully',
  });
});
//delete user from database
const deleteMyProfile = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.userId;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are unauthenticated.');
  }
  const result = await UserService.deleteMyProfile(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'User deleted successfully',
  });
});

//active || deactivate

const ActivateDeactivateAccount = catchAsync(async (req, res) => {
  const userId = (req.user as any)?.userId;
  if (!userId) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are unauthenticated.');
  }

  const { isDeactivated } = req.body;

  if (typeof isDeactivated !== 'boolean') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'isDeactivated field is required and must be a boolean.'
    );
  }

  const result = await UserService.ActivateDeactivateAccount(
    userId,
    isDeactivated
  );

  const statusMessage = isDeactivated
    ? 'Account deactivated successfully'
    : 'Account activated successfully';

  sendResponse(res, {
    code: StatusCodes.OK,
    message: statusMessage,
    data: result,
  });
});
const recoverAccount = catchAsync(async (req, res) => {
  console.log(req.user,'hitted');
  if(!req.body.email){
    throw new AppError(404,'Email is required into body');
  }
  const result = await UserService.recoverAccount(req.body.email);
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk ? 'Successfully Recoverd Account' : 'Failed to Recover Account',
    data: isOk ? result : [],
  });
});


//SOCIAL

const googleCallback = catchAsync(async (req, res) => {
  const user = req.user;
  // console.log("user",user);
  const tokens = await TokenService.accessAndRefreshToken(user as TUser);

  sendResponse(res,{
    message:`Welcome Home`,
    code:200,
    data:{user,tokens}
  })
});

export const UserController = {
  createAdminOrSuperAdmin,
  getAllUsers,
  UpdateProfile,
  getSingleUser,
  getMyProfile,
  deleteMyProfile,
  recoverAccount,
  ActivateDeactivateAccount,
  googleCallback,
};
