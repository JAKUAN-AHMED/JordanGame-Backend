import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import AppError from '../../errors/AppError';
import { UserService } from './user.service';


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

//update user status from database (Admin only)
const updateUserStatus = catchAsync(async (req, res) => {
  // Admin updates other user's status via params.userId
  const { userId } = req.params;
  const { profileStatus } = req.body;

  if (!userId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'userId is required in URL params');
  }

  if (!profileStatus) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'profileStatus is required in request body');
  }

  const result = await UserService.updateUserStatus(userId, profileStatus);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'User status updated successfully',
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

export const UserController = {
  createAdminOrSuperAdmin,
  getAllUsers,
  UpdateProfile,
  getSingleUser,
  updateUserStatus,
  getMyProfile,
  deleteMyProfile,
  recoverAccount,
  ActivateDeactivateAccount,
};
