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

  //create and return sharedstory list
  return await shsModel.create(payload);
};

const SharedStoryList = async (query: any) => {
  const builder = new QueryBuilder(query, shsModel as any);
  const sharedList = await builder
    .filter(['type'])
    .include([
      {
        path: 'sender',
        select: 'fname email',
      },
      {
        path: 'story',
        select: 'title type createdAt',
      },
    ])
    .sort()
    .paginate()
    .execute();

  const meta = await builder.countTotal();
  return {
    meta,
    data: sharedList,
  };
};

const SingleShareList = async (shareListId: string) => {
  return await shsModel.findById(shareListId).populate('story');
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
