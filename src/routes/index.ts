import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';
import { ContactRoutes } from '../modules/contact/contact.routes';
// import { ChatRoutes } from '../modules/chat/chat.routes';
// import { MessageRoutes } from '../modules/message/message.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';

// import { feedbackRoutes } from '../modules/feedback/feedback.route';


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
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  }
  ,
  {
    path:'/notification',
    route:NotificationRoutes
  },
  {
    path:'/setting',
    route:SettingsRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
