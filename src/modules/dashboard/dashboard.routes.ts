// dashboard.routes.ts
import express from 'express';
import { getDashboardOverviewController } from './dashboard.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// GET /api/v1/dashboard/overview?year=2024
router.get('/overview', auth('admin'), getDashboardOverviewController);

export const DashboardRoutes = router;
