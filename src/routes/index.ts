import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';
import { ContactRoutes } from '../modules/contact/contact.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { ContentRoutes } from '../modules/ContentManagement/content.routes';
import { PackageRoutes } from '../modules/package/package.routes';
import { ActionRoutes } from '../modules/action/action.routes';
import { GameDashboardRoutes } from '../modules/gameDashboard/gameDashboard.routes';
import { CollectionsRoutes } from '../modules/collections/collections.routes';




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
  },
  {
    path:'/content',
    route:ContentRoutes
  },
  {
    path:'/package',
    route:PackageRoutes
  },
  {
    path:'/action',
    route:ActionRoutes
  },
  {
    path:'/gaming-dashboard',
    route:GameDashboardRoutes
  },
  {
    path:'/collections',
    route:CollectionsRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
