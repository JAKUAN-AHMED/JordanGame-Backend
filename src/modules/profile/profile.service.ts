import { startSession, Types } from "mongoose";
import { NotFound } from "../../utils/utils";
import { User } from "../user/user.model";
import { TUserProfile } from "./profile.interface";
import { ProfileModel } from "./profile.model";



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
          profileId: profile?.id
        }
      }, {
      new: true,
      runValidators: true
    }
    )
  }

  


  return profile;

};


const updateProfile = async (id: string, payload: Partial<TUserProfile>) => {

  const profile = await ProfileModel.findOne({user:id});
  await NotFound(profile, 'Profile Not Found');


  return await ProfileModel.findByIdAndUpdate(profile?.id,
    {
      $set: payload
    },
    {
      new: true,
      runValidators: true
    }
  )
}


const myProfile = async (id: string) => {
  // const profile=await ProfileModel.findOne({user:id});
  // return profile?.populate('user')

  const profile = await ProfileModel.aggregate([
  { $match: { user: new Types.ObjectId(id) }},
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'userData'
    }
  },
  { $unwind: '$userData' },
  {
    $replaceRoot: {
      newRoot: { $mergeObjects: ['$$ROOT', '$userData'] }
    }
  },
  { $project: { userData: 0, user: 0 ,__v:0}} // remove both old fields
]);

  return profile[0];
}

const deleteProfile = async (id: string) => {
  const session = await startSession();
  try {
    session.startTransaction();
    
    // Find profile by user ID
    const profile = await ProfileModel.findOne({user: new Types.ObjectId(id)}, null, { session });
    await NotFound(profile, 'Profile Not Exist!');
    
    // Delete profile by its _id
    const deleteProfile = await ProfileModel.findByIdAndDelete(profile?._id, { session });
    
    // Remove profile reference and delete user
    await User.findByIdAndUpdate(profile?.user, { $unset: { profileId: '' } }, { session });
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




