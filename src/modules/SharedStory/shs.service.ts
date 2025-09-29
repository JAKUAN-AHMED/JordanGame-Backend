import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { NotFound } from '../../utils/utils';
import { Story } from '../story/story.model';
import { User } from '../user/user.model';
import { Ishs } from './shs.interface';
import { shsModel } from './shs.model';

const createSharedStoryList = async (payload: Ishs) => {
  const { sender, receiver, story } = payload;

  if (!story || !receiver) {
    throw new AppError(404, 'Requireed Filed is missing');
  }

  //check user exist
  const isUserExist = await User.isExistUserById(sender as any);
  await NotFound(isUserExist, 'User Not Found');
  const isReceiverExist = await User.isExistUserById(receiver as any);
  await NotFound(isReceiverExist, 'Receiver Not Found');
  //check sotry exist
  const storyExist = await Story.findOne({
    _id: story,
    status: 'post',
  });
  await NotFound(storyExist, 'Story Not found for this Id');

  await Story.findByIdAndUpdate(
    story,
    {
      $inc: { shared: 1 },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //create and return sharedstory list
  return await shsModel.create(payload);
};

const SharedStoryList = async (query: any) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  // Build filter for story fields (after population)
  const storyFilter: any = {};

  if (query.type) {
    storyFilter['story.type'] = query.type;
  }
  if (query.status) {
    storyFilter['story.status'] = query.status;
  }
  if (query.createdAt) {
    storyFilter['story.createdAt'] = { $gte: new Date(query.createdAt) };
  }

  // Execute the aggregation pipeline
  const pipeline: any = [
    {
      $lookup: {
        from: 'stories',
        localField: 'story',
        foreignField: '_id',
        as: 'story',
      },
    },
    // If the story can be null or empty, preserve it
    {
      $unwind: {
        path: '$story',
        preserveNullAndEmptyArrays: true, // Keep entries even if 'story' is null
      },
    },
    {
      $match: storyFilter, // Apply filter for valid stories after unwind
    },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: 'total' },
        ],
      },
    },
  ];

  const result = await shsModel.aggregate(pipeline as any);

  // Extract the result
  const data = result[0]?.data || [];
  const totalCount = result[0]?.totalCount?.[0]?.total || 0;

  return {
    meta: {
      total: totalCount,
      page,
      limit,
    },
    data,
  };
};



const SingleShareList = async (shareListId: string) => {
  return await shsModel
    .findById(shareListId)
    .populate({ path: 'story', model: Story })
    .populate({
      path: 'sender',
      populate: {
        path: 'profile',
        model: 'Profile',
        select: 'avatar nickname',
      },
      model: User,
      select: 'fname role _id email createdAt',
    });
};
const DeleteSharedList = async (shareListId: string) => {
  return await shsModel.findByIdAndDelete(shareListId);
};

export const SharedStoryServices = {
  createSharedStoryList,
  SharedStoryList,
  SingleShareList,
  DeleteSharedList,
};
