import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import { TUser } from "../modules/user/user.interface";

export const validateUserStatus = async(user: TUser) => {
  if (user.status.isDeleted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted. Please contact support'
    );
  }
  if (user.status.isDeactivated) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deactivated. Please activate  your account'
    );
  }
  if (user.status.isBlocked) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Your account has been blocked. Please contact support'
    );
  }
};


export const isUserDeleted=async(user:TUser | null)=>{
    if (user?.status?.isDeleted) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted'
    );
  }
}

export const NotFound=async(user:TUser | any,msg:string)=>{
  if(!user)
  {
    throw new AppError(StatusCodes.NOT_FOUND, `${msg}`);
  }
}

export const AlreadyExist=async(name:any)=>{
  if(name)
  {
    throw new AppError(409,'Already Exist');
  }
}







export const Verification=async(profileUrl: string, selfieUrl: string) =>{
  
}

// Example usage
// (async () => {
//   const verified = await verify(
//     "https://example.com/uploads/profile.jpg",
//     "https://example.com/uploads/selfie.jpg"
//   );
//   console.log(verified ? "✅ Verified" : "❌ Not verified");
// })();

