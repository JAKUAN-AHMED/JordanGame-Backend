import { NotFound } from "../../utils/utils";
import { User } from "../user/user.model";
import { TUserProfile } from "./profile.interface";
import { ProfileModel } from "./profile.model";



const SetUpProfile = async (payload: TUserProfile) => {


  //retrive the userId and check user exist or not 
  //checke all the field available or not
  //handle file for upload image 
  
  const user=await User.isExistUserById(payload?.user as any);
  await NotFound(user,'user not found!');


  return await ProfileModel.create(payload);

};







export const profileServices={
  SetUpProfile
}




