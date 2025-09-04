import fs from "fs";
import path from "path";
import { exec } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { Story } from "./story.model";
import sharp from "sharp";
import AppError from "../../errors/AppError";
import { generate4DigitFromUUID } from "../../utils/utils";

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

  saveTempFile: (file: Express.Multer.File) => {
    const tempPath = path.join(TEMP_DIR, `${Date.now()}_${file.originalname}`);
    fs.writeFileSync(tempPath, new Uint8Array(file.buffer));
    return tempPath;
  },

  compressVideo: async (filePath: string) => {
    const id=await generate4DigitFromUUID();
    return new Promise<string>((resolve, reject) => {
      const fileName = path.basename(filePath, path.extname(filePath));
      const outFile = path.join(FINAL_DIR, `${fileName}_compressed.mp4${id}`);
      const cmd = `"${ffmpegPath}" -i "${filePath}" -vcodec libx264 -crf 28 "${outFile}" -y`;

      exec(cmd, (err) => {
        if (err) return reject(err);
        safeUnlink(filePath); // delete temp safely
        resolve(outFile);
      });
    });
  },

  compressAudio: async (filePath: string) => {
    const id=await generate4DigitFromUUID();
    return new Promise<string>((resolve, reject) => {
      const fileName = path.basename(filePath, path.extname(filePath));
      const outFile = path.join(FINAL_DIR, `${fileName}_compressed.mp3${id}`);
      const cmd = `"${ffmpegPath}" -i "${filePath}" -b:a 128k "${outFile}" -y`;

      exec(cmd, async (err) => {
        if (err) return reject(err);

        // delete temp safely
        safeUnlink(filePath);

        // now generate HLS chunks for audio
        try {
          const audioChunkFolder = path.join(CHUNKS_DIR, fileName);
          if (!fs.existsSync(audioChunkFolder)) fs.mkdirSync(audioChunkFolder, { recursive: true });

          const hlsCmd = `"${ffmpegPath}" -i "${outFile}" -f hls -hls_time 15 -hls_playlist_type vod "${path.join(audioChunkFolder, "index.m3u8")}"`;
          exec(hlsCmd, (hlsErr) => {
            if (hlsErr) return reject(hlsErr);

            // delete compressed MP3 after HLS chunks
            safeUnlink(outFile);

            // return the path to index.m3u8
            resolve(path.join(audioChunkFolder, "index.m3u8"));
          });
        } catch (hlsError) {
          reject(hlsError);
        }
      });
    });
  },


  compressImage: async (filePath: string) => {
    try {

      const id=await generate4DigitFromUUID();
    
      const outFile = filePath.replace(/\.(jpg|jpeg|png|webp)/,` _compressed.jpg_${id}`);
      await sharp(filePath)
        .resize({ width: 1080 })
        .jpeg({ quality: 80 })
        .toFile(outFile);

      safeUnlink(filePath); // delete temp safely
      return outFile;
    } catch (err) {
      throw new AppError(400, 'Problem found at compressing image')
    }
  },

  generateHLS: async (filePath: string) => {
    const fileName = path.basename(filePath, path.extname(filePath));
    const chunkFolder = path.join(CHUNKS_DIR, fileName);
    if (!fs.existsSync(chunkFolder)) fs.mkdirSync(chunkFolder, { recursive: true });

    return new Promise<string>((resolve, reject) => {
      const cmd = `"${ffmpegPath}" -i "${filePath}" -hls_time 15 -hls_playlist_type vod "${path.join(chunkFolder, "index.m3u8")}"`;
      exec(cmd, (err) => {
        if (err) return reject(err);
        safeUnlink(filePath); // delete compressed file safely
        resolve(path.join(chunkFolder, "index.m3u8"));
      });
    });
  },

  saveStoryDB: async (userId: string, caption: string, mediaUrl: string, type: "video" | "audio" | "image") => {
    return Story.create({ userId, caption, mediaUrl, type });
  },

  getStories: async () => {
    return Story.find().sort({ createdAt: -1 });
  }
};
