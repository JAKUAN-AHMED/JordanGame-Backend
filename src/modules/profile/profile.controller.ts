import AppError from '../../errors/AppError';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import {
  deleteFromDigitalOceanAWS,
  uploadToDigitalOceanAWS,
} from '../../utils/uploadToaws';
import { NotFound } from '../../utils/utils';

import { User } from '../user/user.model';
import { ProfileModel } from './profile.model';
import { ProfileServices } from './profile.service';

const SetUpProfile = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    return sendResponse(res, {
      code: 404,
      message: 'User not found',
      data: null,
    });
  }

  req.body.user = user.userId as string;

  if (req.file) {
    const { location } = await uploadToDigitalOceanAWS(req.file);
    req.body.profileImage = location;
  }

  if (!req.file && !req.body.profileImage) {
    return sendResponse(res, {
      code: 400,
      message: 'Profile image is required',
      data: null,
    });
  }

  // Transform flattened keys to nested objects
  const payload = {
    ...req.body,
    prefCountry: { country: req.body['prefCountry.country'] },
    prefAgeRange: {
      min: req.body['prefAgeRange.min'],
      max: req.body['prefAgeRange.max'],
    },
  };

  console.log('SetUpProfile payload:', payload);

  const result = await ProfileServices.SetUpProfile(payload);

  sendResponse(res, {
    code: 200,
    message: 'Profile created successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  await NotFound(req.user, 'User Not Found');
  req.body.user = req.user.userId as string;
  if (req.file) {
    const user = await User.isExistUserById(req.user.userId);

    const profile = await ProfileModel.findById(user?.profileId);
    if (profile?.profileImage) {
      await deleteFromDigitalOceanAWS(profile?.profileImage);
    }
    const { location } = await uploadToDigitalOceanAWS(req.file);
    req.body.profileImage = location;
  }

  const result = await ProfileServices.updateProfile(req.body);
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk ? 'Successfully Updated Profile' : 'Failed to Update Profile',
    data: isOk ? result : [],
  });
});

const uploadImageForVerification = catchAsync(async (req, res) => {
  const user = await ProfileModel.isExistProfileExistByUserId(
    req.user.userId as string
  );
  const img = user?.profileImage;
  let img2 = '';
  if (!req.file) {
    throw new AppError(404, 'Selfie Required');
  }
  const { location } = await uploadToDigitalOceanAWS(req.file);
  img2 = location;
  const result = await ProfileServices.uploadImageForVerification(
    img as string,
    img2
  );

  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk
      ? 'Successfully Taken Selfie for Verify Profile✔️'
      : 'Failed to Take Selfie for verify  Profile ❌',
    data: isOk ? result : [],
  });
});

const VerifyProfile = catchAsync(async (req, res) => {
  if (!req.user.userId) {
    throw new AppError(404, 'User Not Found');
  }
  const profile = await ProfileModel.isExistProfileExistByUserId(
    req.user.userId
  );
  const result = await ProfileServices.VerifyProfile(
    profile?._id as any,
    req.body.isverified
  );
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk
      ? 'Successfully Verified Profile✔️'
      : 'Failed to  verify  Profile ❌',
    data: isOk ? result : [],
  });
});

const createCountry = catchAsync(async (req, res) => {
  const result = await ProfileServices.createCountry(req.body);
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 201 : 404,
    message: isOk ? 'Successfully Created Country' : 'Failed to Create Country',
    data: isOk ? result : [],
  });
});
const getCountry = catchAsync(async (req, res) => {
  const result = await ProfileServices.getCountry();
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk ? 'Successfully Retrieved Country' : 'Failed to Retrived Country',
    data: isOk ? result : [],
  });
});
const singleCountry = catchAsync(async (req, res) => {
  const result = await ProfileServices.singleCountry(req.params.id);
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk ? 'Successfully Retrieved a Country' : 'Failed to Retrived a Country',
    data: isOk ? result : [],
  });
});
const updateCountry = catchAsync(async (req, res) => {
  const result = await ProfileServices.updateCountry(req.params.id,req.body);
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk ? 'Successfully Updated a Country' : 'Failed to Updated a Country',
    data: isOk ? result : [],
  });
});
const deleteCountry = catchAsync(async (req, res) => {
  const result = await ProfileServices.deleteCountry(req.params.id);
  const isOk = result ? true : false;
  sendResponse(res, {
    code: isOk ? 200 : 404,
    message: isOk ? 'Successfully Deleted a Country' : 'Failed to Deleted a Country',
    data: isOk ? result : [],
  });
});
export const SetUpProfileController = {
  SetUpProfile,
  updateProfile,
  uploadImageForVerification,
  VerifyProfile,
  singleCountry,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry
};
