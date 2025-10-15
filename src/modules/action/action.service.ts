// action.service.ts

import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import { TUserStatus } from "../user/user.constant";
import AppError from "../../errors/AppError";


//action on user

const ActionOnUser = async (userId: string, action: TUserStatus) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Example toggle logic
  if (action === 'active') {
    user.profileStatus = 'active';
  } else if (user.profileStatus === action) {
    user.profileStatus = 'active'; // revert to active
  } else {
    user.profileStatus = action;
  }

  await user.save();
  return user;
};

const UserDisabledAcountorEnabaled = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.profileStatus === 'active') {
    user.profileStatus = 'disabled';
  } else if (user.profileStatus === 'disabled') {
    user.profileStatus = 'active';
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user status');
  }

  await user.save();
  return user;
};

export const ActionService={ ActionOnUser, UserDisabledAcountorEnabaled };