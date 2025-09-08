import { config } from "../../config";
import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";
export const STORY_UPLOADS_FOLDER = 'demoUpload/story';

const mediaConvertClient = new MediaConvertClient({ region: config.aws.region });

export const createMediaConvertJob = async (inputS3Url: string, outputS3Folder: string) => {
  const jobParams = {
    Role: config.aws.mediaConvertRoleArn,
    Settings: {
      OutputGroups: [
        {
          Name: "HLS Group",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: { Destination: `s3://${config.aws.bucketName}/${outputS3Folder}/` },
          },
          Outputs: [
            {
              ContainerSettings: { Container: "M3U8" },
              VideoDescription: { CodecSettings: { Codec: "H_264" } },
              AudioDescriptions: [{ CodecSettings: { Codec: "AAC" } }],
            },
          ],
        },
      ],
      Inputs: [{ FileInput: inputS3Url }],
    },
  };

  const command = new CreateJobCommand(jobParams as any);
  const response = await mediaConvertClient.send(command);
  return response;
};