import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import AppError from '../../errors/AppError';
import { storyServices } from './story.service';

import { uploadSingleFileToS3 } from '../../helpers/S3Service';
import { STORY_UPLOADS_FOLDER } from './stroy.constant';
import { User } from '../user/user.model';

const uploadStory = catchAsync(async (req, res) => {
  const userId = req.User.userId;
  const { caption, description, tags } = req.body;

  // Get files from multer
  const files: Express.Multer.File[] = [];
  if (req.files) {
    const fileFields = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (fileFields['files']) files.push(...fileFields['files']); // images (main file)
    if (fileFields['file']) files.push(...fileFields['file']); // video/audio (main media file)
  }

  // ❌ Throw error if no file uploaded
  if (!files || files.length === 0) {
    throw new AppError(400, 'File is required!');
  }

  // ❌ Throw error if other required fields are missing
  if (!userId || !caption || !description || !tags) {
    throw new AppError(400, 'Required field missing!');
  }

  // Check media type (audio/video)
  const type = files[0]?.mimetype.split('/')[0]; // 'audio' or 'video'

  // Initialize story data structure
  const storyData: any = {
    user: userId,
    caption,
    description,
    tags: Array.isArray(tags) ? tags : [tags],
    type,
    medianame: files[0]?.originalname,
    mediaUrl: [],
    status: 'draft',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiration
  };

  // Handle mediaType - audio/video
 if (type === 'audio' || type === 'video') {
  // Handle thumbnail for both audio and video
  let thumbnailFile: Express.Multer.File[] | undefined;
  if (
    req.files &&
    typeof req.files === 'object' &&
    !Array.isArray(req.files) &&
    'thumbnail' in req.files
  ) {
    thumbnailFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['thumbnail'];
  }

  // If a thumbnail is provided, upload it
  if (thumbnailFile && thumbnailFile.length > 0) {
    const thumbnailUrl = await uploadSingleFileToS3(thumbnailFile[0], `${STORY_UPLOADS_FOLDER}/thumbnails`);
    storyData.thumbnail = thumbnailUrl;
  } else {
    storyData.thumbnail ='https://ibb.co.com/n8022CP8';
  }
}

  
  const receiver=await User.findOne({username:'admin'});
  // Save the story to the database
  const story = await storyServices.saveStoryDB(storyData as any, files, receiver?.id as string);

  // ✅ Response
  sendResponse(res, {
    code: 201,
    message: `${type} story uploaded successfully`,
    data: story,
  });
});

const getMyStories = catchAsync(async (req, res) => {
  const userId = req.User.userId;
  const query = req.query;
  sendResponse(res, {
    message: 'Successfully Retrive my all stories ',
    code: 200,
    data: await storyServices.getMyStories({ userId, query }),
  });
});

const getLatestStories = catchAsync(async (req, res) => {
  sendResponse(res, {
    code: 200,
    message: 'Latest Stories fetched',
    data: await storyServices.getLatestStories(req.query),
  });
});

const deleteMyStory = catchAsync(async (req, res) => {
  const userId = req.User.userId;
  const id = req.params.id;
  sendResponse(res, {
    message: 'Successfully Deleted a Story ',
    code: 200,
    data: await storyServices.deleteStroy({ user: userId, id }),
  });
});

const updateMyStory = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully updated my story ',
    code: 200,
    data: await storyServices.updateMyStory({
      userId: req.User.userId as string,
      id: req.params.id,
      data: req.body,
    }),
  });
});

const librayAudioData = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully retrived libray data ',
    code: 200,
    data: await storyServices.libraryData(req.query,req.User.userId as string),
  });
});

//bookmark controller

const createBookmark = catchAsync(async (req, res) => {
  req.body.user = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Story Added as BookMark',
    code: 201,
    data: await storyServices.bookmarkStory(req.body),
  });
});
const deleteBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Deleted a BookMark',
    code: 200,
    data: await storyServices.deleteBookmark({
      userId: req.body.userId,
      bookmarkId: req.body.bookmarkId,
    }),
  });
});
const getSingleMyBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved a  BookMark',
    code: 200,
    data: await storyServices.getSingleMyBookmark({
      userId: req.body.userId,
      bookmarkId: req.body.bookmarkId,
    }),
  });
});
const getAllMyBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved all  BookMark',
    code: 200,
    data: await storyServices.getAllMyBookmark(req.body.userId, req.query),
  });
});


//all bookmark for admin
const getAllBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved all  BookMark',
    code: 200,
    data: await storyServices.getAllBookmark(req.query),
  });
});



const workingDaysStories = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully Retrieved all working days posts ',
    code: 200,
    data: await storyServices.workingDaysStoreis(req.query),
  });
});
const getAllStories = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully Retrieved all stories thats been uploaded ',
    code: 200,
    data: await storyServices.getAllStories(req.query),
  });
});


//update view count

const viewCountForMedia = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully Updated view count ',
    code: 200,
    data: await storyServices.viewCountForMedia(req.body.isView,req.params.id),
  });
})
export const storyController = {
  uploadStory,
  getLatestStories,
  getMyStories,
  deleteMyStory,
  updateMyStory,
  librayAudioData,
  createBookmark,
  workingDaysStories,
  getAllStories,
  getAllMyBookmark,
  getSingleMyBookmark,
  viewCountForMedia,
  deleteBookmark,
  getAllBookmark
};
