import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TUser } from './user.interface';
import { User } from './user.model';
import { Types } from 'mongoose';
import { TokenService } from '../token/token.service';
import { OtpService } from '../otp/otp.service';
import bcrypt from 'bcrypt';
import { bookmarkModel, Story } from '../story/story.model';
import { Notification } from '../notification/notification.model';
interface MonthData {
  video: number;
  audio: number;
  image: number;
  videoPercent: number;
  imagepercent: number;
  audioPercent: number;
}

interface YearlyData {
  [month: string]: MonthData; // month name as key
}

type MonthType = 'video' | 'audio' | 'image';
interface ResultType {
  [year: number]: YearlyData; // year as key
}
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
        profileId: '$profile._id', // keep profile _id separately
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
const overview = async (yearToFetch: number) => {
  const totaluser = await User.countDocuments();
  const totalBookmark = await bookmarkModel.countDocuments();
  const totalSharedStories = await Story.countDocuments({ shared: true });
  const recentActivity = await Notification.find()
  .select({ title: 1, createdAt: 1, _id: 0 })
  .sort({ createdAt: -1 }).limit(10);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const data = await Story.aggregate([
    {
      $match: {
        status: 'post',
        type: { $in: ['video', 'audio', 'image'] },
        createdAt: {
          $gte: new Date(`${yearToFetch}-01-01`),
          $lt: new Date(`${yearToFetch + 1}-01-01`),
        },
      },
    },
    {
      $project: {
        type: 1,
        month: { $month: '$createdAt' },
      },
    },
    {
      $group: {
        _id: { month: '$month', type: '$type' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Initialize months with names
  const result: ResultType = {};
  result[yearToFetch] = {};
  monthNames.forEach(name => {
    result[yearToFetch][name] = {
      video: 0,
      audio: 0,
      image: 0,
      videoPercent: 0,
      imagepercent: 0,
      audioPercent: 0,
    };
  });

  // Fill counts
  data.forEach(item => {
    const monthIndex = item._id.month - 1;
    const monthName = monthNames[monthIndex];
    const type = item._id.type as MonthType;
    result[yearToFetch][monthName][type] = item.count;
  });

  // Calculate percentages
  monthNames.forEach(name => {
    const monthData = result[yearToFetch][name];
    const total = monthData.video + monthData.audio;
    if (total > 0) {
      monthData.videoPercent = (monthData.video / total) * 100;
      monthData.audioPercent = (monthData.audio / total) * 100;
      monthData.imagepercent = (monthData.image / total) * 100;
    }
  });

  return {
    totalBookmark,
    totalSharedStories,
    totaluser,
    data: result,
    recentActivity
  };
};

export const UserService = {
  createAdminOrSuperAdmin,
  getAllUsers,
  getSingleUser,
  overview,
};
