import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import AppError from '../../errors/AppError';
import { UserService } from './user.service';

import { Types } from 'mongoose';
import { User } from './user.model';
import { NotFound } from '../../utils/utils';

const createAdminOrSuperAdmin = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await UserService.createAdminOrSuperAdmin(payload);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    data: result,
    message: `${
      payload.role === 'admin' ? 'Admin' : 'Super Admin'
    } created successfully`,
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

//update user status from database
const updateUserStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const payload = req.body;
  const result = await UserService.updateUserStatus(userId, payload);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'User status updated successfully',
  });
});

//get my profile
const getMyProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
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
  const userId = req.user.userId;
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
  const result = await UserService.ActivateDeactivateAccount(
    req.params.userId as string,
    req.body.status.isDeactivated
  );
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 201 : 404,
    message: isOk ? 'Successfully Changed Status' : 'Failed to Change Status',
    data: isOk ? result : [],
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
  getSingleUser,
  updateUserStatus,
  getMyProfile,
  deleteMyProfile,
  recoverAccount,
  ActivateDeactivateAccount,
};
