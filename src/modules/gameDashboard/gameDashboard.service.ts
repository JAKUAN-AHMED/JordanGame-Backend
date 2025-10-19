// gameDashboard.service.ts
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { AlreadyExist, NotFound } from '../../utils/utils';
import { ContentModel } from '../ContentManagement/content.model';
import { User } from '../user/user.model';
import { IgameDashboard } from './gameDashboard.interface';
import { GameDashboardModel } from './gameDashboard.model';

//create game dashboard
const createGameDashboard = async (data: Partial<IgameDashboard | any>) => {
  const existingGameDashboard = await GameDashboardModel.findOne({
    user: data.user,
  });
  await AlreadyExist(existingGameDashboard);

  if (!data.isThisFirstTime) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You are not First Time here');
  }

  //1 super carrot=20 game carrot
  // data.totalCarrots = data.totalCarrots / 20 || 0;

  //get the badge for his high score
  const findAchievedBadges = await ContentModel.find({
    targetValueInFt: { $lte: data.highScoreInFt },
  });

  //[push into db]
  if (data && findAchievedBadges.length > 0) {
    data.achievedBadges = findAchievedBadges.map(badge => badge._id);
  }
  const res = await GameDashboardModel.create(data);
  if (res) {
    //make this user first time true
    await User.findByIdAndUpdate(data.user, { isHePlayedFirstTime: true , $inc: { totalGamesPlayed: 1 },level:1});
  }
  //return the result
  return res;
};

const updateGameDashboard = async (
  user: string,
  data: Partial<IgameDashboard>
) => {
  const existingGameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(
    existingGameDashboard,
    'Game Dashboard Not Found For This User'
  );
  // find user
  const userData: any = await User.findById(user);
  await NotFound(userData, 'User Not Found');

  //ensure carrot has and update carrot
  if (userData && userData.totalCarrots) {
    userData.totalCarrots =
      Number(userData?.totalCarrots) + Number(data.totalCarrots);
    await userData.save();
  }

  //update user current game tag
  if (
    userData &&
    userData.CurrentGametag &&
    existingGameDashboard &&
    existingGameDashboard.achievedBadges.length > 0
  ) {
    {
      if (userData && userData.CurrentGametag) {
        const length = existingGameDashboard.achievedBadges.length;
        const id = existingGameDashboard.achievedBadges[length - 1];
        const badge = await ContentModel.findById(id);
        userData.CurrentGametag = badge?.name;
      }
    }

    //update the high score which is latest
    if (
      data &&
      data.highScoreInFt &&
      data.highScoreInFt > existingGameDashboard.highScoreInFt
    ) {
      data.highScoreInFt = data.highScoreInFt;
    }


    //update the number of game played
    if (data && data.numberOfGamesPlayed && existingGameDashboard.level) {
      data.numberOfGamesPlayed = Number(existingGameDashboard.numberOfGamesPlayed + 1);
      data.level = Number(existingGameDashboard.level + 1);
    }
    //final update
    const updatedData = await GameDashboardModel.findByIdAndUpdate(
      existingGameDashboard?._id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      throw new Error('Game Dashboard not found for this user');
    }
    return updatedData;
  }
};

const watchAdsAndGetCarrots = async (user: string, gameWatched: number) => {
  const gameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(gameDashboard, 'Game Dashboard Not Found For This User');
  if (gameDashboard && gameDashboard.totalCarrots) {
    gameDashboard.totalCarrots =
      Number(gameDashboard.totalCarrots) + Number(20) * Number(gameWatched);
  }
  return gameDashboard?.save();
};


//write code for share and get carrots
const shareAndGetCarrots = async (user: string) => {
  const gameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(gameDashboard, 'Game Dashboard Not Found For This User');
  if (gameDashboard && gameDashboard.totalCarrots) {
    gameDashboard.totalCarrots =
      Number(gameDashboard.totalCarrots) + Number(20);
  }
  return gameDashboard?.save();
};

export const GameDashboardService = {
  createGameDashboard,
  updateGameDashboard,
  watchAdsAndGetCarrots,
  shareAndGetCarrots
};
