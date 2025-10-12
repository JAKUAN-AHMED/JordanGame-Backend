import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import { TUser } from "../modules/user/user.interface";
import { v4 as uuidv4 } from "uuid";

export const NotFound=async(user:TUser | any,msg:string)=>{
  if(!user)
  {
    throw new AppError(StatusCodes.NOT_FOUND, `${msg}`);
  }
}

export const AlreadyExist = async (item: any) => {
  if (item) {
    throw new AppError(StatusCodes.CONFLICT, 'This item already exists');
  }
};

export const isUserDeleted = async (profile: any) => {
  if (profile && profile.profileStatus === 'delete') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'This profile has been deleted');
  }
};

export const validateUserStatus = async (profile: any) => {
  if (!profile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Profile not found');
  }

  const invalidStatuses = ['delete', 'block', 'suspend', 'disabled'];
  if (invalidStatuses.includes(profile.profileStatus)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `Account is ${profile.profileStatus}. Please contact support.`
    );
  }
};

export const generate4DigitFromUUID=async() =>{
  return uuidv4().replace(/\D/g, "").substring(0, 4);
}











