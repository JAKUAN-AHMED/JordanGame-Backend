import { Router } from 'express';
import auth from '../../middlewares/auth';
import { feedbackController } from './feedback.controller';
import fileUploadHandler from '../../shared/fileUploadHandler';
import { FEEDBACK_UPLOADS_FOLDER } from './feedback.constant';

const router = Router();

const upload=fileUploadHandler(FEEDBACK_UPLOADS_FOLDER);
//send story
router
  .route('/feedbacks')
  .post(
    auth('common'),
    upload.single('file'),
    feedbackController.createFeedback
  )
  .get(auth('admin'), feedbackController.AllFeedback);

//single
router
  .route('/feedback/:id')
  .get(auth('admin'), feedbackController.SingleFeedbackList)
  .delete(auth('admin'), feedbackController.DeleteFeedbackList);

export const feedbackRoutes = router;
