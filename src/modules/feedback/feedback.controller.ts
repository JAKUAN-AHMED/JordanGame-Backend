// import catchAsync from '../../shared/catchAsync';
// import sendResponse from '../../shared/sendResponse';
// import { feedbackServices } from './feedback.service';


// const createFeedback = catchAsync(async (req, res) => {
//   req.body.user = req.User.userId;
//   sendResponse(res, {
//     message: 'Successfully Given a feedback',
//     code: 201,
//     data: await feedbackServices.createFeedback(req.body,req.file as Express.Multer.File),
//   });
// });

// const AllFeedback = catchAsync(async (req, res) => {
//   sendResponse(res, {
//     message: 'Successfully Retrieved feedback list ',
//     code: 200,
//     data: await feedbackServices.AllFeedback(req.query),
//   });
// });
// const SingleFeedbackList = catchAsync(async (req, res) => {
//   sendResponse(res, {
//     message: 'Successfully Retrieved a feedback ',
//     code: 200,
//     data: await feedbackServices.SingleFeedbackList(req.params.id),
//   });
// });
// const DeleteFeedbackList = catchAsync(async (req, res) => {
//   sendResponse(res, {
//     message: 'Successfully Deleted a Feedback ',
//     code: 200,
//     data: await feedbackServices.DeleteFeedbackList(req.params.id),
//   });
// });


// export const feedbackController={
//     createFeedback,
//     DeleteFeedbackList,
//     SingleFeedbackList,
//     AllFeedback
// }
