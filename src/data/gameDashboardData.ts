import { Types } from 'mongoose';

// This will be populated with actual user IDs after users are seeded
export const createGameDashboardData = (userIds: Types.ObjectId[], contentIds: string[]) => {
  // Select random achievement IDs for each user
  const getRandomAchievements = () => {
    const achievementCount = Math.floor(Math.random() * 4); // 0-3 achievements
    const achievements: string[] = [];
    for (let i = 0; i < achievementCount; i++) {
      const randomIndex = Math.floor(Math.random() * contentIds.length);
      if (!achievements.includes(contentIds[randomIndex])) {
        achievements.push(contentIds[randomIndex]);
      }
    }
    return achievements;
  };

  return [
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[0], // Super Admin
      totalCarrots: 200,
      highScoreInFt: 2500,
      level: 15,
      numberOfGamesPlayed: 120,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[1], // Testing Admin
      totalCarrots: 180,
      highScoreInFt: 2200,
      level: 13,
      numberOfGamesPlayed: 95,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[2], // Test User One
      totalCarrots: 75,
      highScoreInFt: 1500,
      level: 8,
      numberOfGamesPlayed: 45,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[3], // Test User Two
      totalCarrots: 64,
      highScoreInFt: 1350,
      level: 7,
      numberOfGamesPlayed: 38,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[4], // Alice Johnson
      totalCarrots: 50,
      highScoreInFt: 1100,
      level: 5,
      numberOfGamesPlayed: 28,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[5], // Bob Smith
      totalCarrots: 92,
      highScoreInFt: 1800,
      level: 10,
      numberOfGamesPlayed: 62,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[6], // Charlie Davis
      totalCarrots: 30,
      highScoreInFt: 800,
      level: 3,
      numberOfGamesPlayed: 15,
      achievedBadges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[7], // David Miller
      totalCarrots: 120,
      highScoreInFt: 2100,
      level: 12,
      numberOfGamesPlayed: 88,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[8], // Evelyn Garcia
      totalCarrots: 47,
      highScoreInFt: 950,
      level: 4,
      numberOfGamesPlayed: 22,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[9], // Frank White
      totalCarrots: 105,
      highScoreInFt: 1950,
      level: 11,
      numberOfGamesPlayed: 75,
      achievedBadges: getRandomAchievements(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};