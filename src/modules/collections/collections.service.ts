// collections.service.ts

import { get, Types } from 'mongoose';
import { AlreadyExist, NotFound } from '../../utils/utils';
import { ContentModel } from '../ContentManagement/content.model';
import { User } from '../user/user.model';
import { Icollection } from './collections.interface';
import { CollectionModel } from './collections.model';
import AppError from '../../errors/AppError';

const updateUserCarrots = async (
  user: any,
  contentId: Types.ObjectId | string,
  contentModel: any
) => {
  const content = await contentModel.findById(contentId);
  await NotFound(content, 'Content Not Found');

  // Check if the user has enough carrots
  if (
    user &&
    user.totalCarrots &&
    user.totalCarrots > 0 &&
    content &&
    content.numberOfCarrot &&
    content.numberOfCarrot > 0
  ) {
    // Update user carrots
    user.totalCarrots = Number(user.totalCarrots - content.numberOfCarrot);
    await user.save();
  }
};

const createCollection = async (data: Partial<Icollection>) => {
  // Find the user by ID
  let isHeHasEnoughCarrots: any = await User.findById(data.user);
  await NotFound(isHeHasEnoughCarrots, 'User Not Found');

  // Check and update carrots for skin, PowerUps, and carrotPackages
  if (data && data.skin) {
    await updateUserCarrots(
      isHeHasEnoughCarrots,
      data.skin as any,
      ContentModel
    );
  }

  if (data.PowerUps) {
    await updateUserCarrots(
      isHeHasEnoughCarrots,
      data.PowerUps as any,
      ContentModel
    );
  }

  if (data.carrotPackages) {
    const checkCarrotPackagesExist = await ContentModel.findById(
      data.carrotPackages
    );
    await NotFound(checkCarrotPackagesExist, 'Carrot Packages Not Found');

    // Placeholder for payment check: you should implement the payment check here
    // Example: check if payment is completed for the carrot package

    if (checkCarrotPackagesExist) {
      isHeHasEnoughCarrots.totalCarrots = Number(
        isHeHasEnoughCarrots.totalCarrots +
          checkCarrotPackagesExist.numberOfCarrot
      );
    }
  }

  // Save the final changes to the user's carrots
  await isHeHasEnoughCarrots?.save();

  // Check if the collection already exists
  const isExistAlready = await CollectionModel.findOne({
    $or: [
      { skin: { $in: data.skin || [] } }, // Check if any of the data.skin IDs exist in the skin array
      { carrotPackages: { $in: data.carrotPackages || [] } }, // Check if any of the data.carrotPackages IDs exist in the carrotPackages array
      { PowerUps: { $in: data.PowerUps || [] } }, // Check if any of the data.PowerUps IDs exist in the PowerUps array
    ],
  });

  // Handle already existing collection
  await AlreadyExist(isExistAlready);

  // Set IsFirstTime to true and create the collection
  data.IsFirstTime = true;
  return await CollectionModel.create(data);
};

//update collection

const updateCollection = async (id: string, data: Partial<Icollection>) => {
  // Find the user by ID
  const isHeHasEnoughCarrots = await User.findById(data.user);
  await NotFound(isHeHasEnoughCarrots, 'User Not Found');

  //check  the collection has for this user
  const isExistAlready = await CollectionModel.findOne({ user: data.user });
  await NotFound(isExistAlready, 'Collection Not Found For This User');

  let UpdatedData: Partial<Icollection> = {};

  // Handle skin addition
  if (data.skin && data.skin.length > 0) {
    // Check if each skin exists in the database
    const checkSkinsExist = await ContentModel.find({
      _id: { $in: data.skin },
    });
    if (checkSkinsExist.length !== data.skin.length) {
      throw new Error('One or more skins not found');
    }
    // Add the skins to UpdatedData using $addToSet (ensure no duplicates)
    UpdatedData.skin = data.skin;
  }

  // Handle PowerUps addition
  if (data.PowerUps && data.PowerUps.length > 0) {
    // Check if each PowerUp exists in the database
    const checkPowerUpsExist = await ContentModel.find({
      _id: { $in: data.PowerUps },
    });
    if (checkPowerUpsExist.length !== data.PowerUps.length) {
      throw new Error('One or more PowerUps not found');
    }
    // Add the PowerUps to UpdatedData
    UpdatedData.PowerUps = data.PowerUps;
  }

  // Handle carrotPackages addition
  if (data.carrotPackages && data.carrotPackages.length > 0) {
    // Check if each Carrot Package exists in the database
    const checkCarrotPackagesExist = await ContentModel.find({
      _id: { $in: data.carrotPackages },
    });
    if (checkCarrotPackagesExist.length !== data.carrotPackages.length) {
      throw new Error('One or more Carrot Packages not found');
    }

    /**
     * here will be added payment checking or ensuring code for the package
     *
     */
    // Add the carrot packages to UpdatedData
    UpdatedData.carrotPackages = data.carrotPackages;
  }

  // Now update the collection in the database
  const RESPONSE = await CollectionModel.findByIdAndUpdate(
    id,
    { $addToSet: UpdatedData }, // Use $addToSet to avoid duplicates
    { new: true, runValidators: true }
  );

  if (!RESPONSE) {
    throw new Error('Collection not found');
  }

  return RESPONSE;
};

//get the all collection
const getAllMyCollection = async (query: any, userId: string) => {
const limit=Number(query.limit) || 10;
  const page=Number(query.page) || 1;
  const skip = Number((page - 1) * limit);
  const filters: Record<string, any> = {
    user: userId,
  };

  if (query.type) {
    if (query.type == 'skin') {
      filters.skin = { $exists: true };
    } else if (query.type == 'carrotPackages') {
      filters.carrotPackages = { $exists: true };
    } else if (query.type == 'PowerUps') {
      filters.PowerUps = { $exists: true };
    }
  }

  const data = await CollectionModel.find(filters)
  .populate('skin carrotPackages PowerUps')
  .skip(skip).limit(limit);
  if (!data) {
    throw new AppError(404,'Collection Not Found');
  }

  //pagination data
  const total = await CollectionModel.countDocuments(filters);
  const totalPage = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  }; 
};

//get my package collection

export const CollectionService = {
  createCollection,
  updateCollection,
  getAllMyCollection,
};
