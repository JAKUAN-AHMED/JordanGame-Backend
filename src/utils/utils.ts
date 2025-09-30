const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import { TUser } from "../modules/user/user.interface";
import { v4 as uuidv4 } from "uuid";
import path from "path";
export const NotFound=async(user:TUser | any,msg:string)=>{
  if(!user)
  {
    throw new AppError(StatusCodes.NOT_FOUND, `${msg}`);
  }
}



export const generate4DigitFromUUID=async() =>{
  return uuidv4().replace(/\D/g, "").substring(0, 4); 
}







export const getMediaDuration = (filePath: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, ['-i', filePath]);

    ffmpeg.stderr.on('data', (data: any) => {
      const durationMatch = data.toString().match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
      
      if (durationMatch) {
        // Extract hours, minutes, seconds from match
        const hours = durationMatch[1];
        const minutes = durationMatch[2];
        const seconds = Math.floor(parseFloat(durationMatch[3])); // Get integer value of seconds

        // Format the duration to HH:MM:SS
        const formattedDuration = `${hours}:${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        resolve(formattedDuration);
      }
    });

    ffmpeg.on('error', (err: any) => reject(err));
    ffmpeg.on('close', (code: any) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });
  });
};



export const generateThumbnail = (videoPath: string, thumbnailPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpegPath(videoPath)
      .on('end', () => resolve())
      .on('error', (err:any) => reject(err))
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
        size: '320x240',
      });
  });
};