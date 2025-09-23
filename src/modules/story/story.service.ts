import { bookmarkModel, Ibookmark, Story } from './story.model';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';

import {
  deleteFileFromS3,
  uploadSingleFileToS3,
} from '../../helpers/S3Service';
import { Istory } from './story.interface';
import { NotificationService } from '../notification/notification.services';
import { Role } from '../user/user.constant';
import { STORY_UPLOADS_FOLDER } from './stroy.constant';
import { shsModel } from '../SharedStory/shs.model';
import { feedbackModel } from '../feedback/feedback.model';
import { getMediaDuration, NotFound } from '../../utils/utils';

export const storyServices = {
  saveStoryDB: async (
    data: Istory,
    files: Express.Multer.File[],
    receiverId: string
  ) => {
     const { type } = data;

  if (type === "audio" || type === "video") {
    if (files.length > 1) {
      throw new Error('Only a single video/audio is allowed');
    }
    if (!data.thumbnail) {
      throw new Error('Thumbnail is required');
    }
    if (!data.medianame) {
      throw new Error('Media name is required');
    }

    // Get the file path of the uploaded file (it could be from temp storage or buffer)
    const filePath = files[0].path;

    // Extract the duration of the audio/video file
    const duration:string|any = await getMediaDuration(filePath);

    // Check if the duration is provided, else use the extracted duration
    if (data && !data.duration) {
      data.duration = duration;
    }
  }

  if (type === 'image' && files.length === 0) {
    throw new Error('At least one image is required');
  }

  if ((type === 'video' || type === 'audio') && files.length > 1) {
    throw new Error('Only single video/audio is allowed');
  }

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
      { status: 'post' },
      { new: true, runValidators: true }
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
      { status: 'draft' },
      { new: true, runValidators: true }
    );
  }
  return updatedStory;
  },
  deleteStroy: async (payload: { user: string; id: string }) => {
    const { user, id } = payload;

    const userExists = await User.findById(user);
    if (!userExists) {
      throw new AppError(404, 'User Not Found');
    }
    if (userExists.role === 'admin') {
      //delete shared story related to story
      await shsModel.findOneAndDelete({
        story: id,
      });
      //delete feedback related to story
      await feedbackModel.findOneAndDelete({
        story: id,
      });

      //delete bookmark related to story
      await bookmarkModel.findOneAndDelete({
        story: id,
      });

      const storiesMedia = await Story.findById(id);
      if (storiesMedia?.mediaUrl) {
        for (const url of storiesMedia.mediaUrl) {
          await deleteFileFromS3(url as string);
        }
      }
      return await Story.findByIdAndDelete(id);
    }

    //delete shared story related to story
    await shsModel.findOneAndDelete({
      story: id,
    });
    //delete feedback related to story
    await feedbackModel.findOneAndDelete({
      story: id,
    });

    //delete bookmark related to story
    await bookmarkModel.findOneAndDelete({
      story: id,
    });

    const storiesMedia = await Story.findById(id);
    if (storiesMedia?.mediaUrl) {
      for (const url of storiesMedia.mediaUrl) {
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
 libraryData: async (query: Record<string, any>, user: string) => {
  // Find the user data
  const userData = await User.findById(user);
  await NotFound(userData, 'User Not Found');

  const types: ('audio' | 'video' | 'image')[] = ['audio', 'video', 'image'];
  const data: Record<string, any> = {};

  for (const type of types) {
    // Extract pagination info for this type
    const { page = 1, limit = 10, ...restQuery } = query[type] || {};

    // Include the user filter in the query for each type (audio/video/image)
    const typeQuery = { 
      ...restQuery, 
      type, 
      user: user,   // Filter by user ID
      page, 
      limit 
    };

    // Create a query builder with the updated query
    const builder = new QueryBuilder(typeQuery, Story as any);

    // Execute query with filters, search, sorting, pagination
    const results = await builder
      .filter(['type', 'user'])  // Include 'user' in the filter fields
      .search(['caption'])
      .sort()
      .paginate()
      .execute();

    // Get meta information for pagination
    const meta = await builder.countTotal();

    // Store results and meta in the data object
    data[type] = {
      meta,
      results,
    };
  }

  return { data };
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

  //all bookmark for admin
  getAllBookmark: async (query: any) => {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const storyFilter: any = {};

    if (query.type) {
        storyFilter['story.type'] = query.type;
    }

    // Aggregation pipeline
    const pipeline = [
        {
            $lookup: {
                from: 'stories', 
                localField: 'story', 
                foreignField: '_id', 
                as: 'story' 
            }
        },
        {
            $unwind: '$story' 
        },

        
        {
            $match: storyFilter 
        },
        {
            $skip: skip
        },
        {
            $limit: limit 
        },
        {
            $facet: {
                data: [ 
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [ 
                    { $count: 'total' }
                ]
            }
        }
    ];


    // console.log("piepline", pipeline);
    // Execute the aggregation pipeline
    const result = await bookmarkModel.aggregate(pipeline);

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
}
,

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

  //all stories
  getAllStories: async (query: any) => {

    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const storyFiler: any = {};
    if (query.type) {
      storyFiler['type'] = query.type;
    }
    if (query.status) {
      storyFiler['status'] = query.status;
    }
    if (query.createdAt) {
      storyFiler['createdAt'] = { $gte: new Date(query.createdAt) };
    }
    const data = await Story.find(storyFiler)
      .skip(skip)
      .limit(limit)
      .select('caption type status createdAt _id');
    const total = await Story.countDocuments(storyFiler);
    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  },
  //working days stories
  workingDaysStoreis: async (query: any) => {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const data = await Story.find({
      type: 'video',
    })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments({
      type: 'video',
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  },

  //view count
  viewCountForMedia:async(isView:boolean,storyId:string) =>{
    if(isView){
      return await Story.findOneAndUpdate(
        { _id: storyId },
        { $inc: { viewCount: 1 } },
        { new: true }
      );
    }
  }
};
