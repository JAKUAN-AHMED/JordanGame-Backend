import { startSession, Types } from "mongoose";
import { NotFound } from "../../utils/utils";
import { User } from "../user/user.model";
import { TUserProfile } from "./profile.interface";
import { ProfileModel } from "./profile.model";
import { deleteFileFromS3 } from "../../helpers/S3Service";



const SetUpProfile = async (payload: TUserProfile) => {
  //retrive the userId and check user exist or not 
  //checke all the field available or not
  //handle file for upload image 

  const user = await User.isExistUserById(payload?.user as any);
  await NotFound(user, 'user not found!');


  const profile = await ProfileModel.create(payload);

  //if profile exist then add the id into user so that relation can make 
  if (profile) {
    await User.findByIdAndUpdate(payload.user,
      {
        $set: {
          profile: profile?.id
        }
      }, {
      new: true,
      runValidators: true
    }
    )
  }

  


  return profile;

};


const updateProfile = async (id: string, payload: Partial<TUserProfile> & {fname:string}) => {


  if(payload.fname){

    await User.findByIdAndUpdate(id,{
      $set:{
        fname:payload.fname
      }
    })
  }
  const profile = await ProfileModel.findOne({user:id});
  await NotFound(profile, 'Profile Not Found');


  const data= await ProfileModel.findByIdAndUpdate(profile?.id,
    {
      $set: payload
    },
    {
      new: true,
      runValidators: true
    }
  )

  return {
    user:data,
    fname:payload.fname
  }
}


const myProfile = async (id: string) => {
  const user=await User.findById(id).populate('profile')
  await NotFound(user,'User Not Found');

  return user;
}

const deleteProfile = async (id: string) => {
  const session = await startSession();
  try {
    session.startTransaction();
    
    // Find profile by user ID
    const profile = await ProfileModel.findOne({user: new Types.ObjectId(id)}, null, { session });
    await NotFound(profile, 'Profile Not Exist!');
    


    //delete image from profile and aws
    if(profile?.avatar)
    {
      await deleteFileFromS3(profile.avatar as string);
    }

    // Delete profile by its _id
    const deleteProfile = await ProfileModel.findByIdAndDelete(profile?._id, { session });
    
    // Remove profile reference and delete user
    await User.findByIdAndUpdate(profile?.user, { $unset: { profile: '' } }, { session });
    await User.findByIdAndDelete(profile?.user, { session });
    
    await session.commitTransaction();
    session.endSession();
    return deleteProfile;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}




export const profileServices = {
  SetUpProfile,
  updateProfile,
  deleteProfile,
  myProfile,
}




