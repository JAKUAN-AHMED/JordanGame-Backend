// import QueryBuilder from '../../builder/QueryBuilder';
// import AppError from '../../errors/AppError';
// import { uploadSingleFileToS3 } from '../../helpers/S3Service';
// import { NotFound } from '../../utils/utils';
// import { User } from '../user/user.model';
// import { Ifeedback } from './feedback.interface';
// import { feedbackModel } from './feedback.model';

// const createFeedback = async (payload: Ifeedback,file:Express.Multer.File) => {
//   const { story, user, comment, rating } = payload;

//   if (!story || !comment || !rating || !user || !file) {
//     throw new AppError(404, 'Requireed Filed is missing');
//   }
//   let url:string=''
//   if(file)
//   {
//    url = await uploadSingleFileToS3(file, `feedback/${"image"}`);
//    payload.imgurl=url as string;
//   }
//   //check user exist or not
//   const isUserExist = await User.isExistUserById(user as any);
//   await NotFound(isUserExist, 'User Not Found');

//   //check story exist or not
//   const storyExist = await Story.findOne({
//     _id:story,
//     status:"post"
//   });
//   await NotFound(storyExist, 'Story Not found for this Id');

//   return await feedbackModel.create(payload);
// };

// const AllFeedback=async(query:any)=>{
//      const builder=new QueryBuilder(query,feedbackModel as any);
//     const feedback=await builder
//     .filter(['type'])
//     .include([
//         {
//             path:'story', select:'title type createdAt'
//         }
//     ])
//     .sort()
//     .paginate()
//     .execute();

//     const meta=await builder.countTotal()
//     return {
//         meta,
//         data:feedback
//     }
// }

// };

// const SingleFeedbackList=async(feedbackId:string)=>{
//     return await feedbackModel.findById(feedbackId).populate('story');

// }

// const DeleteFeedbackList=async(feedbackId:string)=>{
//     return await feedbackModel.findByIdAndDelete(feedbackId);
// }


// export const feedbackServices={
//     createFeedback,
//     DeleteFeedbackList,
//     SingleFeedbackList,
//     AllFeedback
// }
