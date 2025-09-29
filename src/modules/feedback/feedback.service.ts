import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { uploadSingleFileToS3 } from '../../helpers/S3Service';
import { NotFound } from '../../utils/utils';
import { Story } from '../story/story.model';
import { User } from '../user/user.model';
import { FEEDBACK_UPLOADS_FOLDER } from './feedback.constant';
import { Ifeedback } from './feedback.interface';
import { feedbackModel } from './feedback.model';

const createFeedback = async (
  payload: Ifeedback,
  file: Express.Multer.File
) => {
  const { story, user, comment, rating } = payload;

  // if (!story || !comment || !rating  || !file) {
  //   throw new AppError(404, 'Requireed Filed is missing');
  // }
  let url: string = '';
  if (file) {
    url = await uploadSingleFileToS3(file, `${FEEDBACK_UPLOADS_FOLDER}/${'image'}`);
    payload.imgurl = url as string;
  }
  //check user exist or not
  const isUserExist = await User.isExistUserById(user as any);
  await NotFound(isUserExist, 'User Not Found');

  //check story exist or not
  const storyExist = await Story.findOne({
    _id: story,
    status: 'post',
  });
  await NotFound(storyExist, 'Story Not found for this Id');

  return await feedbackModel.create(payload);
};

const AllFeedback = async (query: any) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;

  const respoData = await feedbackModel.find().populate('story').skip(skip).limit(limit);

  // console.log('Response', respoData);

  const filterData = respoData.filter((item: any) => {
    if (query.type) {
      return item.story.type === query.type;
    }
    return item;
  });
  const total = filterData.length;
  return {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
    data: filterData,
  };

};

const SingleFeedbackList = async (feedbackId: string) => {
  return await feedbackModel.findById(feedbackId).populate('story');
};

const DeleteFeedbackList = async (feedbackId: string) => {
  return await feedbackModel.findByIdAndDelete(feedbackId);
};

export const feedbackServices = {
  createFeedback,
  DeleteFeedbackList,
  SingleFeedbackList,
  AllFeedback,
};
