// gameDashboard.routes.ts

import { Router } from "express";
import auth from "../../middlewares/auth";
import { GameDashboardController } from "./gameDashboard.controller";



const router=Router();


//create game dashboard
router.route('/')
.post(auth('common'),GameDashboardController.createGameDashboard)
.get(auth('common'),GameDashboardController.getMyDashboard)

//update game dashboard
router.route('/:id')
.patch(auth('common'),GameDashboardController.updateGameDashboard)

router.route('/watch-ads-and-get-carrots')
.post(auth('common'),GameDashboardController.watchAdsAndGetCarrots)

router.route('/share-and-get-carrots')
.post(auth('common'),GameDashboardController.shareAndGetCarrots)

//leaderboard
router.route('/leaderboard')
.get(auth('common'),GameDashboardController.getLeaderboard)



export const GameDashboardRoutes=router;

