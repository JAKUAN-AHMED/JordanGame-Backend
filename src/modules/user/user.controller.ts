import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from './user.service';

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
  const {userId} = req.verifyUser;
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
