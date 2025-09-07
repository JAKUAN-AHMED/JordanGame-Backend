import fs from "fs";
import path from "path";
import { exec } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { bookmarkModel, Ibookmark, Story } from "./story.model";
import sharp from "sharp";
import AppError from "../../errors/AppError";
import { generate4DigitFromUUID } from "../../utils/utils";
import { Istory } from "./story.interface";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/QueryBuilder";




const TEMP_DIR = path.join(process.cwd(), "uploads/temp");
const FINAL_DIR = path.join(process.cwd(), "uploads/stories");
const CHUNKS_DIR = path.join(process.cwd(), "uploads/chunks");

// Ensure directories exist
[TEMP_DIR, FINAL_DIR, CHUNKS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Safe unlink with a small delay to prevent EBUSY on Windows
const safeUnlink = async (filePath: string) => {
  setTimeout(() => {
    fs.promises.unlink(filePath).catch(err => console.warn("Failed to delete temp file:", err));
  }, 100);
};

export const storyServices = {
  saveTempFile: (files: Express.Multer.File[]) => {
    return files.map((file, index) => {
      const tempPath = path.join(TEMP_DIR, `${Date.now()}_${index}_${file.originalname}`);
      fs.writeFileSync(tempPath, new Uint8Array(file.buffer));
      return tempPath;
    });
  },

  compressVideo: async (filePath: string) => {
    const id = await generate4DigitFromUUID();
    return new Promise<string>((resolve, reject) => {
      const fileName = path.basename(filePath, path.extname(filePath));
      const outFile = path.join(FINAL_DIR, `${fileName}_compressed_${id}.mp4`);
      const cmd = `"${ffmpegPath}" -i "${filePath}" -vcodec libx264 -crf 28 "${outFile}" -y`;

      exec(cmd, (err) => {
        if (err) return reject(err);
        safeUnlink(filePath);
        resolve(outFile);
      });
    });
  },

  compressAudio: async (filePath: string) => {
    const id = await generate4DigitFromUUID();
    return new Promise<string>((resolve, reject) => {
      const fileName = path.basename(filePath, path.extname(filePath));
      const outFile = path.join(FINAL_DIR, `${fileName}_compressed_${id}.mp3`);
      const cmd = `"${ffmpegPath}" -i "${filePath}" -b:a 128k "${outFile}" -y`;

      exec(cmd, async (err) => {
        if (err) return reject(err);

        safeUnlink(filePath);

        try {
          //generate hls for audio
          const audioChunkFolder = path.join(CHUNKS_DIR, fileName);
          if (!fs.existsSync(audioChunkFolder)) fs.mkdirSync(audioChunkFolder, { recursive: true });

          const hlsCmd = `"${ffmpegPath}" -i "${outFile}" -f hls -hls_time 15 -hls_playlist_type vod "${path.join(audioChunkFolder, "index.m3u8")}"`;
          exec(hlsCmd, (hlsErr) => {
            if (hlsErr) return reject(hlsErr);

            safeUnlink(outFile);
            resolve(path.join(audioChunkFolder, "index.m3u8"));
          });
        } catch (hlsError) {
          reject(hlsError);
        }
      });
    });
  },

  compressImages: async (filePaths: string[]) => {
    const compressedPaths: string[] = [];

    for (const filePath of filePaths) {
      try {
        const id = await generate4DigitFromUUID();
        const fileName = path.basename(filePath, path.extname(filePath));
        const outFile = path.join(FINAL_DIR, `${fileName}_compressed_${id}.jpg`);

        await sharp(filePath)
          .resize({ width: 1080 })
          .jpeg({ quality: 80 })
          .toFile(outFile);

        safeUnlink(filePath);
        compressedPaths.push(outFile);
      } catch (err) {
        throw new AppError(400, `Problem compressing image: ${path.basename(filePath)}`);
      }
    }

    return compressedPaths;
  },

  generateHLS: async (filePath: string) => {
    const fileName = path.basename(filePath, path.extname(filePath));
    const chunkFolder = path.join(CHUNKS_DIR, fileName);
    if (!fs.existsSync(chunkFolder)) fs.mkdirSync(chunkFolder, { recursive: true });

    return new Promise<string>((resolve, reject) => {
      const cmd = `"${ffmpegPath}" -i "${filePath}" -hls_time 15 -hls_playlist_type vod "${path.join(chunkFolder, "index.m3u8")}"`;
      exec(cmd, (err) => {
        if (err) return reject(err);
        safeUnlink(filePath);
        resolve(path.join(chunkFolder, "index.m3u8"));
      });
    });
  },

  saveStoryDB: async (payload: Istory) => {
    const { userId, caption, mediaUrl, type, tags, description } = payload;
    if (!userId || !caption || !mediaUrl || !type || !description || !tags) {
      throw new AppError(404, 'Required field missing ,Please  check again');
    }
    return Story.create({ userId, caption, mediaUrl, type, tags, description });
  },

  deleteStroy: async (payload: {
    userId: string,
    id: string
  }) => {
    const { userId, id } = payload;
    if (!await User.isExistUserById(userId)) {
      throw new AppError(404, 'User Not Found')
    }

    await bookmarkModel.findOneAndDelete({
      storyId:id
    })
    return await Story.findOneAndDelete(
      { userId, _id: id },
    )
  },
  getMyStories: async (payload: { userId: string; query: Record<string, any> }) => {
    const { userId, query } = payload;

    const queryWithLimit = { ...query, limit: 1 };
    // check if user exists
    const userExists = await User.isExistUserById(userId);
    if (!userExists) {
      throw new AppError(404, "User Not Found");
    }

    const builder = new QueryBuilder(queryWithLimit, Story as any);

    const stories = await builder
      .filter(["type"])
      .search(["caption"])
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
    userId: string,
    id: string,
    data: Partial<{
      caption: string,
      description: string
    }>
  }) => {
    const { userId, id, data } = payload;
    return await Story.findByIdAndUpdate({
      _id: id,
      userId,
    },
      data
      , {
        new: true,
        runValidators: true
      })
  },
  getLatestStories: async () => {
    return Story.find().sort({ createdAt: -1 }).limit(10);
  },
  libraryData: async (query: Record<string, any>) => {
    const types: ("audio" | "video" | "image")[] = ["audio", "video", "image"];

    const data: Record<string, any> = {};

    for (const type of types) {
      // extract pagination info for this type
      const { page = 1, limit = 10, ...restQuery } = query[type] || {};

      const typeQuery = { ...restQuery, type, page, limit };

      const builder = new QueryBuilder(typeQuery, Story as any);

      const results = await builder
        .filter(["type"])
        .search(["caption"])
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


  //bookmark related services
  bookmarkStory:async(payload:Ibookmark)=>{
    const {userId,storyId}=payload;
    if(!userId || !storyId)
    {
      throw new AppError(404,'Required field missing')
    }
    const isStoryExist=await Story.isStoryExistByUserId(storyId as any,userId as any);
    if(!isStoryExist)
    {
      throw new AppError(404,'For this Id Story Doesnt Exist');
    }

    const isBookMarkExist=await bookmarkModel.isBookMarkExistUserId(storyId as any,userId as any);
    if(isBookMarkExist) {
     throw new AppError(404,'For this UserId and StoryId Already Exist');
    }
    return await bookmarkModel.create(payload);
  },
  getAllMyBookmark:async(userId:string,query:any)=>{
    const builder=new QueryBuilder(query,bookmarkModel as any);
    const bookmarks=await builder
    .filter(["userId"])
    .include([
     { path:'userId'},
     { path:'storyId'},
    ])
    .paginate()
    .execute();

    const meta=await builder.countTotal();

    return {
      meta,
      data:bookmarks
    }
  },
  getSingleMyBookmark:async(payload:{
    userId:string,bookmarkId:string
  })=>{

    const {userId,bookmarkId}=payload;
    return await bookmarkModel.findOne({
      _id:bookmarkId,
      userId
    })
    .populate('userId')
    .populate('storyId')
  },
  deleteBookmark:async(payload:{
    userId:string,bookmarkId:string
  })=>{
    const {userId,bookmarkId}=payload;
    const isStoryExist=await Story.findById(bookmarkId);
    if(!isStoryExist)
    {
      throw new AppError(404,'Already Deleted');
    }
    return await bookmarkModel.findOneAndDelete({
      _id:bookmarkId,
      userId
    })
  }


};
