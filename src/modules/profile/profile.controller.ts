import AppError from '../../errors/AppError';
import { uploadSingleFileToS3 } from '../../helpers/S3Service';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { USER_UPLOADS_FOLDER } from '../user/user.constant';
import { profileServices } from './profile.service';


const SetUpProfile = catchAsync(async (req, res) => {

  const user = req.User;
  if (!user) {
    return sendResponse(res, {
      code: 404,
      message: 'User not found',
      data: null,
    });
  }

  req.body.user = user.userId;
  let filePath: string | null = null;

  if (!req.file) {
    throw new AppError(404, 'fILE IS REQUIRED HERE~!')
  }
  let imageUrl: string = '';
  if (req.file) {
    const type="image";
     imageUrl = await uploadSingleFileToS3(req.file, `${USER_UPLOADS_FOLDER}/profile`);
  }
  if (imageUrl) {
    req.body.avatar = imageUrl;
  }

  const result = await profileServices.SetUpProfile(req.body);
  const isok = result ? true : false;
  sendResponse(res, {
    message: isok ? 'Successfully set up profile ' : "something went wrong",
    code: isok ? 200 : 404,
    data: isok ? result : []
  })
});


const updateProfile = catchAsync(async (req, res) => {
  let imageUrl = '';
  if (req.file && req.file!=null) {
    imageUrl = await uploadSingleFileToS3(req.file, `${USER_UPLOADS_FOLDER}/image`);
    req.body.avatar = imageUrl as string;
  }

  const result = await profileServices.updateProfile(req.User.userId, req.body);
  const isok = result ? true : false;
  sendResponse(res, {
    message: isok ? 'Successfully set updated profile ' : "something went wrong",
    code: isok ? 200 : 400,
    data: isok ? result : []
  })
})


const myProfile = catchAsync(async (req, res) => {

  const result = await profileServices.myProfile(req.User.userId);
  sendResponse(res, {
    message: 'Successfully retrieved my profile ',
    code:  200,
    data:result
  })
})

const deleteProfile = catchAsync(async (req, res) => {
  const result = await profileServices.deleteProfile(req.User.userId as string);
  const isok = result ? true : false;
  sendResponse(res, {
    message: isok ? 'Successfully deleted profile ' : "something went wrong",
    code: isok ? 200 : 404,
    data: isok ? result : []
  })
})

export const SetUpProfileController = {
  SetUpProfile,
  myProfile,
  updateProfile,
  deleteProfile
};
