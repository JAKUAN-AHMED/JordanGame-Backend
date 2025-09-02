import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import { TUser } from "../modules/user/user.interface";


export const NotFound=async(user:TUser | any,msg:string)=>{
  if(!user)
  {
    throw new AppError(StatusCodes.NOT_FOUND, `${msg}`);
  }
}









