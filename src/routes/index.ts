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
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
