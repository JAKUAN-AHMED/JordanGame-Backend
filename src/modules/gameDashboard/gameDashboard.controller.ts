import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { GameDashboardService } from "./gameDashboard.service";

// gameDashboard.controller.ts
const createGameDashboard = catchAsync(async (req, res) => {
    const result = await GameDashboardService.createGameDashboard(req.body);
    sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Game Dashboard created successfully',
        data: result,
    });
})

const updateGameDashboard = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await GameDashboardService.updateGameDashboard(id, req.body);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Game Dashboard updated successfully',
        data: result,
    });
})

const watchAdsAndGetCarrots = catchAsync(async (req, res) => {
    const result = await GameDashboardService.watchAdsAndGetCarrots(req.User.userId,req.body.adsWatched);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Game Dashboard updated successfully',
        data: result,
    });
})

const shareAndGetCarrots = catchAsync(async (req, res) => {
    const result = await GameDashboardService.shareAndGetCarrots(req.User.userId);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Game Dashboard updated successfully',
        data: result,
    });
})


const getMyDashboard = catchAsync(async (req, res) => {
    const result = await GameDashboardService.getMyDashboard(req.User.userId);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Game Dashboard updated successfully',
        data: result,
    });
})


const getLeaderboard = catchAsync(async (req, res) => {
    const result = await GameDashboardService.getLeaderboard(req.query);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Game Leaderdoard Data fetched successfully',
        data: result,
    });
})

export const GameDashboardController = {
    createGameDashboard,
    updateGameDashboard,
    watchAdsAndGetCarrots,
    shareAndGetCarrots,
    getMyDashboard,
    getLeaderboard
}