import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
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
  const { userId } = req.User;
  const result = await UserService.getSingleUser(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result ? result : [],
    message: 'User fetched successfully',
  });
});

//update user status from database


export const UserController = {
  createAdminOrSuperAdmin,
  getAllUsers,
  getSingleUser,
};
