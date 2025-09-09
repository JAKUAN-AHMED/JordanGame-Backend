import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import colors from 'colors';
import { s3Client } from '../aws/awsConfig';
import { config } from '../config';
import { logger, errorLogger } from '../shared/logger';
import util from "util";
import sharp from "sharp";
import { exec } from "child_process";
import ffmpegPath from "ffmpeg-static";


const execPromise = util.promisify(exec);

// Supported file types and their max sizes
const FILE_LIMITS = {
  images: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  documents: {
    extensions: ['pdf', 'doc', 'docx', 'txt'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  videos: {
    extensions: ['mp4', 'avi', 'mov', 'wmv'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  audio: {
    extensions: ['mp3', 'wav', 'ogg'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
};

/**
 * Validate file type and size
 */
const validateFile = (file: Express.Multer.File) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);

  // Check if file type is supported
  let fileCategory: string | null = null;
  let maxSize = 0;

  for (const [category, limits] of Object.entries(FILE_LIMITS)) {
    if (limits.extensions.includes(fileExtension)) {
      fileCategory = category;
      maxSize = limits.maxSize;
      break;
    }
  }

  if (!fileCategory) {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }

  // Check file size
  if (file.size > maxSize) {
    throw new Error(
      `File size exceeds ${maxSize / (1024 * 1024)
      }MB limit for ${fileCategory}: ${file.originalname}`
    );
  }

  return { fileCategory, fileExtension };
};

/**
 * Clean up local temporary files
 */
export const cleanupLocalFiles = (filePaths: string[]) => {
  const parentFolders = new Set<string>();

  // Delete all files first
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(colors.green(`🗑️  Cleaned up file: ${filePath}`));
      }

      // Track parent folder for later deletion
      parentFolders.add(path.dirname(filePath));
    } catch (err) {
      logger.warn(
        colors.yellow(`⚠️  Failed to delete file ${filePath}: ${err}`)
      );
    }
  });

  // Delete parent folders if empty
  parentFolders.forEach(folder => {
    try {
      if (fs.existsSync(folder) && fs.readdirSync(folder).length === 0) {
        fs.rmdirSync(folder);
        logger.info(colors.green(`🗑️  Deleted empty folder: ${folder}`));
      }
    } catch (err) {
      logger.warn(
        colors.yellow(`⚠️  Failed to delete folder ${folder}: ${err}`)
      );
    }
  });
};

/**
 * Upload single file to S3
 */
export const uploadSingleFileToS3 = async (
  file: Express.Multer.File,
  uploadsFolder: string,
  customFileName?: string
): Promise<string> => {
  const filePaths: string[] = [];
  const tempDir = path.join(process.cwd(), 'uploads/temp');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Determine source file path
    let sourcePath = file.path;
    if (!sourcePath && file.buffer) {
      sourcePath = path.join(tempDir, `${uuidv4()}_${file.originalname}`);
      fs.writeFileSync(sourcePath, file.buffer as any);
    }
    if (!sourcePath) throw new Error('No file source available for upload');

    filePaths.push(sourcePath);

    // Generate unique filename base
    const fileExtension = path.extname(file.originalname).slice(1) || 'bin';
    const baseFileName = customFileName || uuidv4();

    if (file.mimetype.startsWith('image/')) {
      // Image compression
      const buffer = file.buffer || fs.readFileSync(sourcePath);
      const uploadBuffer = await sharp(buffer)
        .resize({ width: 1080 })
        .jpeg({ quality: 80 })
        .toBuffer();

      const key = `${uploadsFolder}/${baseFileName}.jpg`;

      await s3Client.send(new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key,
        Body: uploadBuffer,
        ContentType: file.mimetype,
        Metadata: { originalName: file.originalname, uploadedAt: new Date().toISOString() },
      }));

      return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    }

    if (file.mimetype.startsWith('video/')) {
      // Video → HLS conversion
      const hlsDir = path.join(tempDir, `${baseFileName}_hls`);
      if (!fs.existsSync(hlsDir)) fs.mkdirSync(hlsDir);

      const playlistPath = path.join(hlsDir, 'index.m3u8');

      const cmd = `"${ffmpegPath}" -i "${sourcePath}" -codec: copy -start_number 0 \
        -hls_time 10 -hls_list_size 0 -f hls "${playlistPath}"`;

      await execPromise(cmd);

      if (!fs.existsSync(playlistPath)) throw new Error('FFmpeg HLS conversion failed');

      // Upload all HLS segments
      const files = fs.readdirSync(hlsDir);
      const hlsUrls: string[] = [];

      for (const f of files) {
        const filePath = path.join(hlsDir, f);
        const fileBuffer = fs.readFileSync(filePath);
        const key = `${uploadsFolder}/video/${baseFileName}/${f}`;

        await s3Client.send(new PutObjectCommand({
          Bucket: config.aws.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: f.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T',
        }));

        if (f === 'index.m3u8') hlsUrls.push(`https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`);
      }

      filePaths.push(...files.map(f => path.join(hlsDir, f)));
      return hlsUrls[0]; // return the .m3u8 playlist URL
    }

    if (file.mimetype.startsWith('audio/')) {
      // Audio compression
      const compressedPath = path.join(tempDir, `${baseFileName}.mp3`);
      const cmd = `"${ffmpegPath}" -i "${sourcePath}" -b:a 128k "${compressedPath}" -y`;
      await execPromise(cmd);

      if (!fs.existsSync(compressedPath)) throw new Error('FFmpeg failed to create audio');

      const uploadBuffer = fs.readFileSync(compressedPath);
      const key = `${uploadsFolder}/audio/${baseFileName}.mp3`;

      await s3Client.send(new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key,
        Body: uploadBuffer,
        ContentType: file.mimetype,
        Metadata: { originalName: file.originalname, uploadedAt: new Date().toISOString() },
      }));

      filePaths.push(compressedPath);
      return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
    }

    // Fallback → upload raw file
    const uploadBuffer = file.buffer || fs.readFileSync(sourcePath);
    const key = `${uploadsFolder}/${baseFileName}.${fileExtension}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
      Body: uploadBuffer,
      ContentType: file.mimetype,
    }));

    return `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  } catch (error) {
    errorLogger.error('Single file upload failed', { error, fileName: file.originalname });
    throw new Error(
      `File upload failed for ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    cleanupLocalFiles(filePaths);
  }
};


/**
 * Upload multiple files to S3
 */
export const uploadFilesToS3 = async (
  files: Express.Multer.File[],
  uploadsFolder: string,
): Promise<string[]> => {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const fileUrls: string[] = [];
  const filePaths: string[] = [];

  logger.info(
    colors.blue(`📤 Starting upload of ${files.length} files to S3...`)
  );

  try {
    // Process each file
    for (const file of files) {
      const filePath = file.path || path.join(uploadsFolder, file.filename);
      filePaths.push(filePath);

      // Validate file
      const { fileExtension } = validateFile(file);

      // Read file
      const uploadBuffer = fs.readFileSync(filePath);

      // Generate unique filename
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = `${uploadsFolder}/${fileName}`;

      logger.info(colors.cyan(`📤 Uploading: ${file.originalname}`));

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: config.aws.bucketName,
        Key: key,
        Body: uploadBuffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);

      // Generate file URL
      const fileUrl = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
      fileUrls.push(fileUrl);

      logger.info(colors.green(`✅ Uploaded: ${file.originalname}`));
    }

    logger.info(
      colors.green(`🎉 All ${files.length} files uploaded successfully!`)
    );
    return fileUrls;
  } catch (error) {
    errorLogger.error('Multiple files upload failed', {
      error,
      filesCount: files.length,
      fileNames: files.map(f => f.originalname),
    });

    throw new Error(
      `Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  } finally {
    // Clean up all local files
    cleanupLocalFiles(filePaths);
  }
};

/**
 * Delete file from S3
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // Remove leading slash

    logger.info(colors.blue(`🗑️  Deleting file from S3: ${key}`));

    const command = new DeleteObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });

    await s3Client.send(command);

    logger.info(colors.green(`✅ File deleted successfully: ${key}`));
  } catch (error) {
    errorLogger.error('Failed to delete file from S3', {
      error,
      fileUrl,
    });

    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Delete multiple files from S3
 */
export const deleteMultipleFilesFromS3 = async (
  fileUrls: string[]
): Promise<void> => {
  if (!fileUrls || fileUrls.length === 0) {
    return;
  }

  logger.info(colors.blue(`🗑️  Deleting ${fileUrls.length} files from S3...`));

  try {
    const deletePromises = fileUrls.map(url => deleteFileFromS3(url));
    await Promise.allSettled(deletePromises);

    logger.info(
      colors.green(`✅ Batch delete completed for ${fileUrls.length} files`)
    );
  } catch (error) {
    errorLogger.error('Batch delete failed', {
      error,
      fileUrls,
    });

    throw new Error(
      `Batch delete failed: ${error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Get file info from S3 URL
 */
export const getFileInfoFromUrl = (fileUrl: string) => {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1);
    const fileName = path.basename(key);
    const fileExtension = path.extname(fileName).slice(1);

    return {
      key,
      fileName,
      fileExtension,
      bucket: config.aws.bucketName,
      region: config.aws.region,
    };
  } catch (error) {
    throw new Error(`Invalid S3 URL: ${fileUrl}`);
  }
};

// Export utility functions
export const s3Utils = {
  uploadSingle: uploadSingleFileToS3,
  uploadMultiple: uploadFilesToS3,
  deleteSingle: deleteFileFromS3,
  deleteMultiple: deleteMultipleFilesFromS3,
  getFileInfo: getFileInfoFromUrl,
  validateFile,
  cleanupLocalFiles,
};