import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Types } from 'mongoose';


const createAdminOrSuperAdmin = async (payload: TUser) => {
  const existingUser = await User.findOne({ email: payload.email });
 if(!existingUser){
    throw new AppError(404,'User not Found for this Email')
 }

 //update the existing admin
 await User.findOneAndUpdate({
  role:"admin"
 },{
  $set:{
    role:"user"
  }
 },{
  new:true,
  runValidators:true
 })


 //making admin
 await User.findOneAndUpdate({
  email:payload.email
 },{
  $set:{
    role:"admin"
  }
 },{
  new:true,
  runValidators:true
 })
 
};

const getSingleUser = async (userId: string): Promise<TUser | null> => {
  const result = await User.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'profiles',
        localField: '_id',
        foreignField: 'user',
        as: 'profile',
      },
    },
    { $unwind: '$profile' },
    { $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$profile'] } } },
    { $project: { profile: 0 } }, // removed profile field
  ]);
  return result[0];
};

const getAllUsers = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.aggregate([
    {
      $lookup: {
        from: 'profiles', // collection name
        localField: '_id',
        foreignField: 'user',
        as: 'profile',
      },
    },
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        profile: '$profile._id', // keep profile _id separately
        user: '$_id', // keep original user _id
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ['$$ROOT', '$profile'] },
      },
    },
    { $project: { _id: 0, profile: 0 } }, // remove nested profile field
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await User.countDocuments({ 'status.isDeleted': false });
  const totalPage = Math.ceil(total / limit);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

//overview api


export const UserService = {
  createAdminOrSuperAdmin,
  getAllUsers,
  getSingleUser,
};
