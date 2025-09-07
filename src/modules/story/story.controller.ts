import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errors/AppError";
import { storyServices } from "./story.service";
import { Istory } from "./story.interface";



const uploadStory = catchAsync(async (req, res) => {
  const user = req.User;
  if (!user) throw new AppError(404, "User not found");

  if (!req.body.type || !req.body.caption || !req.body.description) {
    throw new AppError(404, 'required fields missing');
  }

  console.log(req.body)
  const { type, caption } = req.body;
  if (!["video", "audio", "image"].includes(type)) {
    throw new AppError(400, "Invalid type");
  }

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError(400, "File is required");
  }

  // Restrict multiple uploads for video/audio
  if ((type === "video" || type === "audio") && req.files.length > 1) {
    throw new AppError(403, `You can upload only one ${type} file`);
  }

  let finalPaths: string | string[] = "";
  let mediaUrls: string | string[] = "";

  if (type === "image") {

    //multiple images
    const invalidFiles = req.files.filter(file => !file.mimetype.startsWith("image/"));
    if (invalidFiles.length > 0) {
      throw new AppError(
        400,
        `Only image files are allowed. Invalid: ${invalidFiles.map(f => f.originalname).join(", ")}`
      );
    }

    // Save + compress
    const tempPaths = storyServices.saveTempFile(req.files);
    finalPaths = await storyServices.compressImages(tempPaths);

    // Build URLs
    mediaUrls = (finalPaths as string[]).map(filePath =>
      `${process.env.BACKEND_LIVE_URL}/${filePath.replace(process.cwd(), "").replace(/\\/g, "/").substring(1)}`
    );
  } else {
    // ✅ Single video/audio
    const file = req.files[0];
    const expectedType = type === "video" ? "video/" : "audio/";
    if (!file.mimetype.startsWith(expectedType)) {
      throw new AppError(400, `Only ${type} files are allowed for ${type} type`);
    }

    // Save temp + process
    const [tempPath] = storyServices.saveTempFile([file]);

    if (type === "video") {
      const compressedPath = await storyServices.compressVideo(tempPath);
      finalPaths = await storyServices.generateHLS(compressedPath); // string
    } else {
      finalPaths = await storyServices.compressAudio(tempPath); // string
    }

    // Build URL
    mediaUrls = `${process.env.BACKEND_LIVE_URL}/${(finalPaths as string)
      .replace(process.cwd(), "")
      .replace(/\\/g, "/")
      .substring(1)}`;
  }

  // ✅ Save in DB
  const payload: Istory = {
    userId: user.userId,          // from auth
    caption: req.body.caption,
    description: req.body.description,
    tags: req.body.tags,
    mediaUrl: Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls],
    type: req.body.type,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // optional, 24h expiration
  };

  const stories = await storyServices.saveStoryDB(payload as any);

  // ✅ Response
  sendResponse(res, {
    code: 201,
    message: Array.isArray(stories)
      ? `${stories.length} ${type} stories uploaded successfully`
      : `${type} story uploaded successfully`,
    data: stories,
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
  sendResponse(res, { code: 200, message: "Latest Stories fetched", data: await storyServices.getLatestStories() });
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

  req.body.userId=req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Story Added as BookMark',
    code: 201,
    data: await storyServices.bookmarkStory(req.body)
  })

})
const deleteBookmark = catchAsync(async (req, res) => {
  req.body.userId=req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Deleted a BookMark',
    code: 200,
    data: await storyServices.deleteBookmark({userId:req.body.userId,bookmarkId:req.body.bookmarkId})
  })
})
const getSingleMyBookmark = catchAsync(async (req, res) => {
  req.body.userId=req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved a  BookMark',
    code: 200,
    data: await storyServices.getSingleMyBookmark({userId:req.body.userId,bookmarkId:req.body.bookmarkId})
  })
})
const getAllMyBookmark = catchAsync(async (req, res) => {
  req.body.userId=req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully Retrieved all  BookMark',
    code: 200,
    data: await storyServices.getAllMyBookmark(req.body.userId,req.query)
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
  getAllMyBookmark,
  getSingleMyBookmark,
  deleteBookmark
};
