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



export const generate4DigitFromUUID=async() =>{
  return uuidv4().replace(/\D/g, "").substring(0, 4); 
}







