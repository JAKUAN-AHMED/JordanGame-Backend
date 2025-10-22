// collections.service.ts

import { get, Types } from 'mongoose';
import { AlreadyExist, NotFound } from '../../utils/utils';
import { ContentModel } from '../ContentManagement/content.model';
import { User } from '../user/user.model';
import { Icollection } from './collections.interface';
import { CollectionModel } from './collections.model';
import AppError from '../../errors/AppError';
import { packageModel } from '../package/package.model';
import { StatusCodes } from 'http-status-codes';
import { TransactionModel } from '../Transactions/Transactions.model';

const updateUserCarrots = async (
  user: any,
  contentIds: Types.ObjectId[] | string[],
  contentModel: any
) => {
  const content = await contentModel.find({ _id: { $in: contentIds } });
  if (content && content.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
  }

  const totalCarrots = content.reduce(
    (acc: number, curr: any) => acc + curr.numberOfCarrot,
    0
  );

  // Check if the user has enough carrots
  if (
    user &&
    user.totalCarrots &&
    user.totalCarrots > 0 &&
    totalCarrots > 0 &&
    totalCarrots <= user.totalCarrots
  ) {
    // Update user carrots
    user.totalCarrots = Number(user.totalCarrots - totalCarrots);
    await user.save();
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Not enough carrots');
  }
};

const createCollection = async (data: Partial<Icollection>) => {
  // Find the user by ID
  const user:any = await User.findById(data.user);
  await NotFound(user, 'User Not Found');

  //check is he brought first time
  if (user.isHeBroughtFirstTime) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User is not allowed to create collection');
  }
  // Update carrots for skin
  if (data.skin) {
    await updateUserCarrots(user, data.skin as any, ContentModel);
  }

  // Update carrots for PowerUps
  if (data.PowerUps) {
    await updateUserCarrots(user, data.PowerUps as any, ContentModel);
  }

  // Update carrots for carrotPackages
  if (data.carrotPackages) {
    const packages = await packageModel.find({
      _id: { $in: data.carrotPackages },
    });

    if (!packages.length) {
      throw new AppError(404, 'Carrot Package Not Found');
    }

    // Check if user has paid for each package
    for (const carrotPackage of data.carrotPackages) {
      const packageExist = await packageModel.findById(carrotPackage);
      await NotFound(packageExist, 'Package not found');

      const paid = await TransactionModel.findOne({
        user: user._id,
        package: carrotPackage,
      });
      if (!paid) {
        throw new AppError(400, 'You have not paid for this package');
      }
    }

    // Sum up total carrots from packages safely
    const totalCarrotsFromPackages = packages.reduce((acc: number, curr: any) => {
      const num = Number(curr.numberOfCarrot);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    // Update user's total carrots safely
    user.totalCarrots = (Number(user.totalCarrots) || 0) + totalCarrotsFromPackages;
  }

  
  // Check if collection already exists
  const isExistAlready = await CollectionModel.findOne({
    user: data.user,
    $or: [
      { skin: { $in: data.skin || [] } },
      { carrotPackages: { $in: data.carrotPackages || [] } },
      { PowerUps: { $in: data.PowerUps || [] } },
    ],
  });
  
  await AlreadyExist(isExistAlready);
  // Mark that the user has brought first time
  user.isHeBroughtFirstTime = true;

  // Save user updates
  await user.save();

  // Create and return new collection
  return await CollectionModel.create(data);
};


//update collection
const updateCollection = async (
  id: string,
  data: Partial<Icollection> | any
) => {
  // Find the user by ID
  const user:any = await User.findById(data.user);
  await NotFound(user, 'User Not Found');

  // Check if the collection exists for this user
  const collection = await CollectionModel.findOne({ user: data.user });
  await NotFound(collection, 'Collection Not Found For This User');

  const UpdatedData: Partial<Icollection> = {};

  // Handle skin addition
  if (data.skin && data.skin.length > 0) {
    const skins = await ContentModel.find({ _id: { $in: data.skin } });

    if (skins.length !== data.skin.length) {
      throw new Error('One or more skins not found');
    }

    const totalCarrots = skins.reduce(
      (acc: number, curr: any) => acc + Number(curr.numberOfCarrot || 0),
      0
    );

    if (totalCarrots > (Number(user.totalCarrots) || 0)) {
      throw new Error('Not enough carrots for selected skins');
    }

    user.totalCarrots = (Number(user.totalCarrots) || 0) - totalCarrots;
    UpdatedData.skin = data.skin;
  }

  // Handle PowerUps addition
  if (data.PowerUps && data.PowerUps.length > 0) {
    const powerUps = await ContentModel.find({ _id: { $in: data.PowerUps } });

    if (powerUps.length !== data.PowerUps.length) {
      throw new Error('One or more PowerUps not found');
    }

    const totalCarrots = powerUps.reduce(
      (acc: number, curr: any) => acc + Number(curr.numberOfCarrot || 0),
      0
    );

    if (totalCarrots > (Number(user.totalCarrots) || 0)) {
      throw new Error('Not enough carrots for selected PowerUps');
    }

    user.totalCarrots = (Number(user.totalCarrots) || 0) - totalCarrots;
    UpdatedData.PowerUps = data.PowerUps;
  }

  // Handle carrotPackages addition
  if (data.carrotPackages && data.carrotPackages.length > 0) {
    const packages = await packageModel.find({
      _id: { $in: data.carrotPackages },
    });

    if (packages.length !== data.carrotPackages.length) {
      throw new Error('One or more carrot packages not found');
    }

    // Check payment for each package
    for (const pkg of data.carrotPackages) {
      const paid = await TransactionModel.findOne({
        user: user._id,
        package: pkg,
        status: 'success',
      });
      if (!paid) {
        throw new Error('You have not paid for package ' + pkg.toString());
      }
    }

    const totalCarrots = packages.reduce(
      (acc: number, curr: any) => acc + Number(curr.numberOfCarrot || 0),
      0
    );

    user.totalCarrots = (Number(user.totalCarrots) || 0) + totalCarrots;
    UpdatedData.carrotPackages = data.carrotPackages;
  }

  // Save user's updated carrots
  await user.save();

  // Update collection with $addToSet to avoid duplicates
  const updatedCollection = await CollectionModel.findByIdAndUpdate(
    id,
    { $addToSet: UpdatedData },
    { new: true, runValidators: true }
  );

  if (!updatedCollection) {
    throw new Error('Collection not found');
  }

  return updatedCollection;
};


//get the all collection
const getAllMyCollection = async ( userId: string) => {
 

 return await CollectionModel.find({ user: userId })
    .populate(['skin', 'carrotPackages', 'PowerUps']).populate({
      path: 'user',
      model: 'User',
      select: 'fullName email phone address profileImage role profileStatus totalCarrots lastLoginAt',
    });

};


export const CollectionService = {
  createCollection,
  updateCollection,
  getAllMyCollection,
};
