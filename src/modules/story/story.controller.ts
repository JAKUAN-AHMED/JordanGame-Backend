import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errors/AppError";
import { storyServices } from "./story.service";

const uploadStory = catchAsync(async (req, res) => {
  const user = req.User;
  if (!user) throw new AppError(404, "User not found");
  if (!req.file) throw new AppError(400, "File is required");

  const { type, caption } = req.body;
  if (!["video", "audio", "image"].includes(type)) throw new AppError(400, "Invalid type");

  // 1️⃣ Save temp file
  let tempPath = storyServices.saveTempFile(req.file);

  // 2️⃣ Compress or generate HLS
  let finalPath: string;

  if (type === "video") {
    tempPath = await storyServices.compressVideo(tempPath);
    finalPath = await storyServices.generateHLS(tempPath); // index.m3u8
  } else if (type === "audio") {
      finalPath = await storyServices.compressAudio(tempPath); // index.m3u8 for audio
  } else {
    finalPath = await storyServices.compressImage(tempPath);
  }

  // 3️⃣ Prepare URL
  const mediaUrl = `${process.env.BACKEND_LIVE_URL}/${finalPath.replace(process.cwd(), "").replace(/\\/g, "/").substring(1)}`;

  // 4️⃣ Save to DB
  const story = await storyServices.saveStoryDB(user.userId, caption, mediaUrl, type as any);

  sendResponse(res, { code: 200, message: "Story uploaded", data: story });
});

const getStories = catchAsync(async (req, res) => {
  const stories = await storyServices.getStories();
  sendResponse(res, { code: 200, message: "Stories fetched", data: stories });
});

export const storyController = {
  uploadStory,
  getStories
};
