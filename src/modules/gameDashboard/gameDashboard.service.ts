// gameDashboard.service.ts
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { AlreadyExist, NotFound } from '../../utils/utils';
import { ContentModel } from '../ContentManagement/content.model';
import { User } from '../user/user.model';
import { IgameDashboard } from './gameDashboard.interface';
import { GameDashboardModel } from './gameDashboard.model';
import { CollectionModel } from '../collections/collections.model';
import { Model, Types } from 'mongoose';
import { Icontent } from '../ContentManagement/content.interface';

const levelUpLogic = (currentScore: number) => {
  let level = 1;
  let threshold = 100; // First level-up at 100 points

  // Keep increasing the level until the score exceeds the threshold
  while (currentScore >= threshold) {
    level++;
    threshold += 200; // Increase threshold by 200 for each level-up after the first
  }

  return level;
};

//create game dashboard
const createGameDashboard = async (data: Partial<IgameDashboard | any>) => {
  const existingGameDashboard = await GameDashboardModel.findOne({
    user: data.user,
  });
  await AlreadyExist(existingGameDashboard);

  if (data.isThisFirstTime) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You are not First Time here');
  }

  //1 super carrot=20 game carrot
  data.totalCarrots = data.totalCarrots / 20 || 0;

  //get the badge for his high score
  const findAchievedBadges = await ContentModel.find({
    targetValueInFt: { $lte: data.highScoreInFt },
  });
  console.log('findAchievedBadges', findAchievedBadges);

  //[push into db]
  if (data && findAchievedBadges.length > 0) {
    data.achievedBadges = findAchievedBadges.map(badge => badge._id);
  }
  const res = await GameDashboardModel.create(data);
  if (res) {
    //make this user first time true
    await User.findByIdAndUpdate(data.user, { isHePlayedFirstTime: true });

    //update level and total games played
    await User.findByIdAndUpdate(data.user, {
      totalGamesPlayed: Number(data.totalGamesPlayed) + 1,
    });
    return await GameDashboardModel.findByIdAndUpdate(
      res._id,
      { level: Number(1), numberOfGamesPlayed: Number(1) },
      { new: true }
    );
  }
};

const updateGameDashboard = async (
  user: string,
  data: Partial<IgameDashboard>
) => {
  const existingGameDashboard: any = await GameDashboardModel.findOne({ user });
  await NotFound(
    existingGameDashboard,
    'Game Dashboard Not Found For This User'
  );

  // Find user
  const userData: any = await User.findById(user);
  await NotFound(userData, 'User Not Found');

  const updateData: Partial<IgameDashboard> = {};

  // Always add totalCarrots
  if (data.totalCarrots && Number(data.totalCarrots) > 0) {
    userData.totalCarrots =
      (Number(userData.totalCarrots) || 0) + Number(data.totalCarrots);
    await userData.save();
    updateData.totalCarrots = userData.totalCarrots;
  }

  // Update current game tag if badges exist
  if (existingGameDashboard.achievedBadges.length > 0) {
    const lastBadgeId =
      existingGameDashboard.achievedBadges[
        existingGameDashboard.achievedBadges.length - 1
      ];
    const lastBadge = await ContentModel.findById(lastBadgeId);
    if (lastBadge?.name) {
      userData.CurrentGametag = lastBadge.name;
      await userData.save();
    }
  }

  // Update high score if higher than previous
  if (
    data.highScoreInFt &&
    data.highScoreInFt > existingGameDashboard.highScoreInFt
  ) {
    updateData.highScoreInFt = data.highScoreInFt;
  }

  // Increment number of games played
  updateData.numberOfGamesPlayed =
    (Number(existingGameDashboard.numberOfGamesPlayed) || 0) + 1;

  // Update level based on current high score
  const currentHighScore =
    updateData.highScoreInFt || existingGameDashboard.highScoreInFt;
  updateData.level = levelUpLogic(Number(currentHighScore));

  // Append new badges if provided
  if (data.achievedBadges && data.achievedBadges.length > 0) {
    updateData.achievedBadges = [
      ...new Set([
        ...(existingGameDashboard.achievedBadges || []),
        ...data.achievedBadges,
      ]),
    ];
  }

  // Final update
  const updatedDashboard = await GameDashboardModel.findByIdAndUpdate(
    existingGameDashboard._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedDashboard) {
    throw new Error('Game Dashboard not found for this user');
  }

  return updatedDashboard;
};

const watchAdsAndGetCarrots = async (user: string, adsWatched: number) => {
  const gameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(gameDashboard, 'Game Dashboard Not Found For This User');
  if (gameDashboard && gameDashboard.totalCarrots) {
    gameDashboard.totalCarrots =
      Number(gameDashboard.totalCarrots) + Number(20) * Number(adsWatched);
  }
  return gameDashboard?.save();
};

//write code for share and get carrots
const shareAndGetSkin = async (user: string) => {
  //target :  share and aget skin
  const gameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(gameDashboard, 'Game Dashboard Not Found For This User');

  //get user collection
  const collectionData = await CollectionModel.findOne({ user });
  await NotFound(collectionData, 'Collection Not Found For This User');

  const getFreeSkin = await ContentModel.find({
    category: 'skin',
    skinType: 'free',
  });
  //get all free skin
  const availableSkins =collectionData && collectionData.skin?.filter((skin: any,idx: number) => {
    return getFreeSkin[idx]._id.toString() !== skin._id.toString();
  })
  if ( availableSkins && availableSkins.length>0) {
    const randomIndex =Math.floor(Math.random() * availableSkins.length);
    const randomSkin:Types.ObjectId  = availableSkins[randomIndex as number];
    if (randomSkin  && collectionData && collectionData.skin) {
      collectionData.skin.push(randomSkin as Types.ObjectId);
    }
  }
  else{
    throw new Error('No more free skins available');
  }
  return collectionData?.save();
};

//get my dashboard
const getMyDashboard = async (user: string) => {
  const gameDashboard = await GameDashboardModel.findOne({ user })
    .populate({
      path: 'user',
      model: 'User',
    })
    .populate({
      path: 'achievedBadges',
      model: 'Content',
    });

  const achievements = await ContentModel.countDocuments({
    category: 'achievement',
  });
  const dashboardAchievements = gameDashboard?.achievedBadges.length;
  return {
    gameDashboard,
    achievements,
    dashboardAchievements,
  };
};

//leaderboard according to the user higest score and level
const getLeaderboard = async (user: any, query: any) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = Number((page - 1) * limit);

  // Get all leaderboard data first
  const resultData: any = await GameDashboardModel.find()
    .populate({
      path: 'user',
      model: 'User',
      select: 'fullName profileImage totalCarrots CurrentGametag _id',
    })
    .select(
      'user totalCarrots highScoreInFt level numberOfGamesPlayed updatedAt'
    )
    .sort({ highScoreInFt: -1, level: -1 });

  // Filter by name if provided
  let filteredData = resultData;
  if (query.name) {
    filteredData = resultData.filter((data: any) => {
      return (
        data.user &&
        data.user.fullName &&
        data.user.fullName.toLowerCase().includes(query.name.toLowerCase())
      );
    });
  }

  // Apply pagination
  const paginatedData = filteredData.slice(skip, skip + limit);

  // Get today's leaderboard (last 24 hours of activity)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let todayLeaderboard = resultData
    .filter(
      (item: any) => item.updatedAt && new Date(item.updatedAt) >= last24Hours
    )
    .slice(0, limit);

  // If no recent activity, show top performers
  if (todayLeaderboard.length === 0) {
    todayLeaderboard = resultData.slice(0, limit);
  }

  const total = filteredData.length;
  const totalPage = Math.ceil(total / limit);
  const yourBestScore = await GameDashboardModel.findOne({ user }).sort({
    highScoreInFt: -1,
  });
  return {
    data: paginatedData,
    todayLeaderboard,
    yourBestScore,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};
export const GameDashboardService = {
  createGameDashboard,
  updateGameDashboard,
  watchAdsAndGetCarrots,
  shareAndGetSkin,
  getMyDashboard,
  getLeaderboard,
};
