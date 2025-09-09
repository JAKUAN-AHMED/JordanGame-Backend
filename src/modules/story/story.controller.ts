import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errors/AppError";
import { storyServices } from "./story.service";



const uploadStory = catchAsync(async (req, res) => {
  const userId = req.User.userId;
  const { caption, description, tags, type } = req.body;

 

  // Get files correctly from multer fields
  const files: Express.Multer.File[] = [];

  if (req.files) {
    const fileFields = req.files as { [fieldname: string]: Express.Multer.File[] };
    // images
    if (fileFields['files']) files.push(...fileFields['files']);
    // video/audio
    if (fileFields['file']) files.push(...fileFields['file']);
  }

   if (!userId || !caption || !description || !tags || !type || !files) {
    throw new AppError(404, 'Required Field missing!');
  }
  const storyData = {
    userId,
    caption,
    description,
    tags: Array.isArray(tags) ? tags : [tags],
    type,
    mediaUrl: [],
    status: "draft",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };


  // ✅ Response
  sendResponse(res, {
    code: 201,
    message: `${type} story uploaded successfully`,
    data:await storyServices.saveStoryDB(storyData as any, files,req.body.receiverId),
  });
});
  



const getMyStories = catchAsync(async (req, res) => {
  const userId = req.User.userId;
  const query = req.query;
  sendResponse(res, {
    message: 'Successfully Retrive my all stories ',
    code: 200,
    data: await storyServices.getMyStories({ userId, query })
  })

})

const getLatestStories = catchAsync(async (req, res) => {
  sendResponse(res, { code: 200, message: "Latest Stories fetched", data: await storyServices.getLatestStories(req.query) });
});

const deleteMyStory = catchAsync(async (req, res) => {
  const userId = req.User.userId;
  const id = req.params.id;
  sendResponse(res, {
    message: 'Successfully Deleted a Story ',
    code: 200,
    data: await storyServices.deleteStroy({ userId, id })
  })

})


const updateMyStory = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully updated my story ',
    code: 200,
    data: await storyServices.updateMyStory({ userId: req.User.userId as string, id: req.params.id, data: req.body })
  })
})

const librayAudioData = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully retrived libray data ',
    code: 200,
    data: await storyServices.libraryData(req.query)
  })
})


//bookmark controller

const createBookmark = catchAsync(async (req, res) => {

  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Story Added as BookMark',
    code: 201,
    data: await storyServices.bookmarkStory(req.body)
  })

})
const deleteBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Deleted a BookMark',
    code: 200,
    data: await storyServices.deleteBookmark({ userId: req.body.userId, bookmarkId: req.body.bookmarkId })
  })
})
const getSingleMyBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved a  BookMark',
    code: 200,
    data: await storyServices.getSingleMyBookmark({ userId: req.body.userId, bookmarkId: req.body.bookmarkId })
  })
})
const getAllMyBookmark = catchAsync(async (req, res) => {
  req.body.userId = req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved all  BookMark',
    code: 200,
    data: await storyServices.getAllMyBookmark(req.body.userId, req.query)
  })
})


//shared track

const sharedStory=catchAsync(async(req ,res)=>{
   sendResponse(res, {
      message:'Successfully Retrieved  Updated Shared Story',
      code: 200,
      data: await storyServices.StoryShared(req.params.id as string)
    })
})
export const storyController = {
  uploadStory,
  getLatestStories,
  getMyStories,
  deleteMyStory,
  updateMyStory,
  librayAudioData,
  createBookmark,
  sharedStory,
  getAllMyBookmark,
  getSingleMyBookmark,
  deleteBookmark
};
