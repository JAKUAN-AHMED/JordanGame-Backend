import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { GameDashboardService } from './gameDashboard.service';
import { Types } from 'mongoose';

// gameDashboard.controller.ts
const createGameDashboard = catchAsync(async (req, res) => {
    req.body.user = ( req.user as any).userId as any;
  const result = await GameDashboardService.createGameDashboard(req.body);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Game Dashboard created successfully',
    data: result,
  });
});

const updateGameDashboard = catchAsync(async (req, res) => {
 const userId = ( req.user as any).userId as any;
  const result = await GameDashboardService.updateGameDashboard(userId, req.body);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Game Dashboard updated successfully',
    data: result,
  });
});

const watchAdsAndGetCarrots = catchAsync(async (req, res) => {
  const result = await GameDashboardService.watchAdsAndGetCarrots(
   (req.user as any).userId as any,
    req.body.adsWatched
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Game Dashboard updated successfully',
    data: result,
  });
});

const shareAndGetCarrots = catchAsync(async (req, res) => {
  const result = await GameDashboardService.shareAndGetCarrots((req.user as any).userId as any);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Game Dashboard updated successfully',
    data: result,
  });
});

const getMyDashboard = catchAsync(async (req, res) => {

  const userId = (req.user as any)?.userId as any;
  const result = await GameDashboardService.getMyDashboard(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Game Dashboard Retrieved successfully',
    data: result,
  });
});

const getLeaderboard = catchAsync(async (req, res) => {
  const result = await GameDashboardService.getLeaderboard((req.user as any) .userId as any,req.query);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Game Leaderdoard Data fetched successfully',
    data: result,
  });
});

export const GameDashboardController = {
  createGameDashboard,
  updateGameDashboard,
  watchAdsAndGetCarrots,
  shareAndGetCarrots,
  getMyDashboard,
  getLeaderboard,
};
