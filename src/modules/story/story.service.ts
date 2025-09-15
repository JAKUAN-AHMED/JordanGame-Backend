import { bookmarkModel, Ibookmark, Story } from './story.model';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';

import { deleteFileFromS3, uploadSingleFileToS3 } from '../../helpers/S3Service';
import { Istory } from './story.interface';
import { NotificationService } from '../notification/notification.services';
import { Role } from '../user/user.constant';
import { STORY_UPLOADS_FOLDER } from './stroy.constant';

export const storyServices = {
  saveStoryDB: async (
    data: Istory,
    files: Express.Multer.File[],
    receiverId: string
  ) => {
    const { type } = data;
    if (type === 'image' && files.length === 0)
      throw new Error('At least one image is required');

    if ((type === 'video' || type === 'audio') && files.length > 1)
      throw new Error('Only single video/audio is allowed');

    const mediaUrls: string[] = [];
    for (const file of files) {
      const url = await uploadSingleFileToS3(file, `${STORY_UPLOADS_FOLDER}/${type}`);
      mediaUrls.push(url as any);
    }
    const story = await Story.create({
      ...data,
      status: 'pending',
      mediaUrl: mediaUrls,
    });

    let updatedStory = null;
    if (Array.isArray(story?.mediaUrl) && Number(story.mediaUrl?.length) >= 1) {
      updatedStory = await Story.findByIdAndUpdate(
        { _id: story._id },
        {
          status: 'post',
        },
        {
          new: true,
          runValidators: true,
        }
      );

      const user = await User.findById(data.user);
      const notification = {
        receiverId,
        title: `${user?.fname} Posted ${story.type} Story`,
        senderId: data.user,
        role: 'admin' as Role,
      };

      await NotificationService.addCustomNotification(
        'admin-notification',
        notification,
        receiverId
      );
    } else {
      updatedStory = await Story.findByIdAndUpdate(
        { _id: story._id },
        {
          status: 'draft',
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }
    return updatedStory;
  },
  deleteStroy: async (payload: { user: string; id: string }) => {
    const { user, id } = payload;
    if (!(await User.isExistUserById(user))) {
      throw new AppError(404, 'User Not Found');
    }

    await bookmarkModel.findOneAndDelete({
      story: id,
    });

    const storiesMedia=await Story.findById(id);
    if(storiesMedia?.mediaUrl)
    {
      for(const url of storiesMedia.mediaUrl ){
        await deleteFileFromS3(url as string);
      }
    }
    return await Story.findOneAndDelete({ user, _id: id });
  },
  getMyStories: async (payload: {
    userId: string;
    query: Record<string, any>;
  }) => {
    const { userId, query } = payload;

    const queryWithLimit = { ...query, limit: 1 };
    // check if user exists
    const userExists = await User.isExistUserById(userId);
    if (!userExists) {
      throw new AppError(404, 'User Not Found');
    }

    const builder = new QueryBuilder(queryWithLimit, Story as any);

    const stories = await builder
      .filter(['type'])
      .search(['caption'])
      .sort()
      .paginate()
      .execute();

    const meta = await builder.countTotal();

    return {
      meta,
      data: stories,
    };
  },
  updateMyStory: async (payload: {
    userId: string;
    id: string;
    data: Partial<{
      caption: string;
      description: string;
    }>;
  }) => {
    const { userId, id, data } = payload;
    return await Story.findByIdAndUpdate(
      {
        _id: id,
        userId,
      },
      data,
      {
        new: true,
        runValidators: true,
      }
    );
  },
  getLatestStories: async (query: Record<string, any>) => {
    const builder = new QueryBuilder(query, Story as any);
    const story = await builder
      .filter(['status', 'type'])
      .include([
        {
          path: 'user',
          select: 'fname',
        },
      ])
      .sort()
      .execute();

    const meta = await builder.countTotal();

    return {
      meta,
      data: story,
    };
  },
  libraryData: async (query: Record<string, any>) => {
    const types: ('audio' | 'video' | 'image')[] = ['audio', 'video', 'image'];

    const data: Record<string, any> = {};

    for (const type of types) {
      // extract pagination info for this type
      const { page = 1, limit = 10, ...restQuery } = query[type] || {};

      const typeQuery = { ...restQuery, type, page, limit };

      const builder = new QueryBuilder(typeQuery, Story as any);

      const results = await builder
        .filter(['type'])
        .search(['caption'])
        .sort()
        .paginate()
        .execute();

      const meta = await builder.countTotal();

      data[type] = {
        meta,
        results,
      };
    }

    return { data };
  },

  //track user share
  StoryShared: async (id: string) => {
    if (!(await Story.findById(id))) {
      throw new AppError(404, "Story Doesn't Exist");
    }
    return await Story.findByIdAndUpdate(
      id,
      {
        $inc: { shared: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  },
  //bookmark related services
  bookmarkStory: async (payload: Ibookmark) => {
    const { story, user } = payload;
    if (!user || !story) {
      throw new AppError(404, 'Required field missing');
    }
    const isStoryExist = await Story.findOne({
      _id: story,
      status: 'post',
    });
    if (!isStoryExist) {
      throw new AppError(404, 'For this Id Story Doesnt Exist');
    }

    const isBookMarkExist = await bookmarkModel.isBookMarkExistUserId(
      story as any,
      user as any
    );
    if (isBookMarkExist) {
      throw new AppError(404, 'For this UserId and StoryId Already Exist');
    }
    return await bookmarkModel.create(payload);
  },
  getAllMyBookmark: async (userId: string, query: any) => {
    const builder = new QueryBuilder(query, bookmarkModel as any);
    const bookmarks = await builder
      .filter(['user'])
      .include([{ path: 'user' }, { path: 'story' }])
      .paginate()
      .execute();

    const meta = await builder.countTotal();

    return {
      meta,
      data: bookmarks,
    };
  },
  getSingleMyBookmark: async (payload: {
    userId: string;
    bookmarkId: string;
  }) => {
    const { userId, bookmarkId } = payload;
    return await bookmarkModel
      .findOne({
        _id: bookmarkId,
        userId,
      })
      .populate('user')
      .populate('story');
  },
  deleteBookmark: async (payload: { userId: string; bookmarkId: string }) => {
    const { userId, bookmarkId } = payload;
    const isStoryExist = await Story.findById(bookmarkId);
    if (!isStoryExist) {
      throw new AppError(404, 'Already Deleted');
    }
    return await bookmarkModel.findOneAndDelete({
      _id: bookmarkId,
      userId,
    });
  },
};
