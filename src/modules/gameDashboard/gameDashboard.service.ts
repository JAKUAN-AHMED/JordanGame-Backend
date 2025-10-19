// gameDashboard.service.ts
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { AlreadyExist, NotFound } from '../../utils/utils';
import { ContentModel } from '../ContentManagement/content.model';
import { User } from '../user/user.model';
import { IgameDashboard } from './gameDashboard.interface';
import { GameDashboardModel } from './gameDashboard.model';


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


      //update the level
      data.level=levelUpLogic(Number(data.highScoreInFt));
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
const shareAndGetCarrots = async (user: string) => {
  const gameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(gameDashboard, 'Game Dashboard Not Found For This User');
  if (gameDashboard && gameDashboard.totalCarrots) {
    gameDashboard.totalCarrots =
      Number(gameDashboard.totalCarrots) + Number(20);
  }
  return gameDashboard?.save();
};


//get my dashboard
const getMyDashboard = async (user: string) => {
  const gameDashboard = await GameDashboardModel.findOne({ user });
  await NotFound(gameDashboard, 'Game Dashboard Not Found For This User');
  return gameDashboard;
}

//leaderboard according to the user higest score and level
const getLeaderboard = async (query: any) => {
  const limit=Number(query.limit) || 10;
  const page=Number(query.page) || 1;
  const skip = Number((page - 1) * limit);


  const filters: Record<string, any> = {};


  // i want to get today leaderboard to display
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  filters.createdAt = { $gte: startOfDay, $lte: endOfDay };

  const resultData:any = await GameDashboardModel.find()
  .populate('user')
  .sort({ highScoreInFt: -1 ,level: -1 })
  .skip(skip)
  .limit(limit);

  const filteredData=resultData.filter((data:any)=>{
    if(query.name && resultData && resultData.user){
      return resultData.user.fullName.toLowerCase().includes(query.name.toLowerCase());
    }
  })

  const sortedData=filteredData.sort((a:any,b:any)=>{
    if(a.highScoreInFt && b.highScoreInFt){
      return b.highScoreInFt-a.highScoreInFt;
    }
  })

  const todayLeaderboard = await GameDashboardModel.find(filters)
  .populate('user')
  .sort({ highScoreInFt: -1 ,level: -1 })
  .skip(skip)
  .limit(limit);

  const total =query.name? sortedData.length:await GameDashboardModel.countDocuments();
  const totalPage = Math.ceil(total / limit);
  return {
    data:query.name? sortedData: resultData,
    todayLeaderboard,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
  
}
export const GameDashboardService = {
  createGameDashboard,
  updateGameDashboard,
  watchAdsAndGetCarrots,
  shareAndGetCarrots,
  getMyDashboard,
  getLeaderboard
};
