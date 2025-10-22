import { Types } from 'mongoose';

export const createCollectionsData = (
  userIds: Types.ObjectId[], 
  skinIds: string[], 
  powerUpIds: string[], 
  packageIds: string[]
) => {
  // Helper to get random items from an array
  const getRandomItems = (arr: string[], count: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
  };

  return [
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[0], // Super Admin
      skin: getRandomItems(skinIds, 4),
      carrotPackages: getRandomItems(packageIds, 3),
      PowerUps: getRandomItems(powerUpIds, 3),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[1], // Testing Admin
      skin: getRandomItems(skinIds, 3),
      carrotPackages: getRandomItems(packageIds, 2),
      PowerUps: getRandomItems(powerUpIds, 3),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[2], // Test User One
      skin: getRandomItems(skinIds, 2),
      carrotPackages: getRandomItems(packageIds, 1),
      PowerUps: getRandomItems(powerUpIds, 2),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[3], // Test User Two
      skin: getRandomItems(skinIds, 2),
      carrotPackages: getRandomItems(packageIds, 1),
      PowerUps: getRandomItems(powerUpIds, 2),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[4], // Alice Johnson
      skin: getRandomItems(skinIds, 1),
      carrotPackages: [],
      PowerUps: getRandomItems(powerUpIds, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[5], // Bob Smith
      skin: getRandomItems(skinIds, 3),
      carrotPackages: getRandomItems(packageIds, 2),
      PowerUps: getRandomItems(powerUpIds, 2),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[6], // Charlie Davis
      skin: getRandomItems(skinIds, 1),
      carrotPackages: [],
      PowerUps: getRandomItems(powerUpIds, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[7], // David Miller
      skin: getRandomItems(skinIds, 3),
      carrotPackages: getRandomItems(packageIds, 2),
      PowerUps: getRandomItems(powerUpIds, 3),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[8], // Evelyn Garcia
      skin: getRandomItems(skinIds, 1),
      carrotPackages: getRandomItems(packageIds, 1),
      PowerUps: getRandomItems(powerUpIds, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId().toString(),
      user: userIds[9], // Frank White
      skin: getRandomItems(skinIds, 2),
      carrotPackages: getRandomItems(packageIds, 2),
      PowerUps: getRandomItems(powerUpIds, 2),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
};