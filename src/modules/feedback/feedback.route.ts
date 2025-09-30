// import { Router } from 'express';
// import auth from '../../middlewares/auth';
// import { feedbackController } from './feedback.controller';
// import { upload } from '../../helpers/File/FileUpload';

// const router = Router();

// //send story
// router
//   .route('/feedbacks')
//   .post(
//     auth('common'),
//     upload.single('file'),
//     feedbackController.createFeedback
//   )
//   .get(auth('admin'), feedbackController.AllFeedback);

// //single
// router
//   .route('/feedback/:id')
//   .get(auth('admin'), feedbackController.SingleFeedbackList)
//   .delete(auth('admin'), feedbackController.DeleteFeedbackList);

// export const feedbackRoutes = router;
