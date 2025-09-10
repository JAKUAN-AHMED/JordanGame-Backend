import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';
import { ContactRoutes } from '../modules/contact/contact.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { ChatRoutes } from '../modules/chat/chat.routes';
import { MessageRoutes } from '../modules/message/message.routes';
import { StoryRoutes } from '../modules/story/story.route';
import { TagRoutes } from '../modules/story_Tag/st.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { ShareStoryListRoutes } from '../modules/SharedStory/shs.routes';
import { feedbackRoutes } from '../modules/feedback/feedback.route';


const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/chat',
    route: ChatRoutes,
  },
  {
    path: '/message',
    route: MessageRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path:'/story',
    route:StoryRoutes
  },
  {
    path:'/tag',
    route:TagRoutes
  }
  ,
  {
    path:'/notification',
    route:NotificationRoutes
  },
  {
    path:'/share_story',
    route:ShareStoryListRoutes
  },
  {
    path:'/feedback',
    route:feedbackRoutes
  },
  {
    path:'/setting',
    route:SettingsRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
