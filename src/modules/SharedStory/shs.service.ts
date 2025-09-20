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
    )

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
  const data = await shsModel
    .find(storyFilter)
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
    })
    .skip(skip)
    .limit(limit)
    .exec();

  const filteredData: any = data.filter(item => {
    let matches: boolean = true;

    const storyDoc = item.story as typeof Story | any;

    if (
      storyFilter['story.type'] &&
      storyDoc?.type !== storyFilter['story.type']
    ) {
      matches = false;
    }

    if (
      storyFilter['story.status'] &&
      storyDoc?.status !== storyFilter['story.status']
    ) {
      matches = false;
    }

    if (
      storyFilter['story.createdAt'] &&
      new Date(storyDoc?.createdAt) < storyFilter['story.createdAt']
    ) {
      matches = false;
    }

    return matches;
  });

  const total = await shsModel.countDocuments(storyFilter);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
    data: filteredData,
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
