import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ChatController } from './chat.controller';

const router = Router();

//group chat
router
  .route('/group-chat')
  .post(auth('common'), ChatController.createGroupChat);
router
  .route('/')
  .get(auth('common'), ChatController.getAllChatsByUserId)
  .post(auth('common'), ChatController.createSingleChat);



  export const ChatRoutes = router