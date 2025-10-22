// dashboard.controller.ts
import { Request, Response } from 'express';

import { getDashboardOverview } from './dashboard.service';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

export const getDashboardOverviewController = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    
    // Validate year
    if (isNaN(year) || year < 2000 || year > 2100) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        message: 'Invalid year provided',
        data: null,
      });
    }

    const result = await getDashboardOverview(year);

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Dashboard Overview Data fetched successfully',
      data: result,
    });
  }
);
