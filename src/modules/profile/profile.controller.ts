import AppError from '../../errors/AppError';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { profileServices } from './profile.service';


const SetUpProfile = catchAsync(async (req, res) => {

 const user = req.user;
  if (!user) {
    return sendResponse(res, {
      code: 404,
      message: 'User not found',
      data: null,
    });
  }

  req.body.user = user.userId ;
  let filePath: string | null = null;

  if (!req.file) {
    throw new AppError(404, 'fILE IS REQUIRED HERE~!')
  }
  filePath = `http://localhost:8000/uploads/${req.file.filename}`;

  req.body.avatar = filePath as string;

  const result = await profileServices.SetUpProfile(req.body);
  // const result = "hello";
  const isok = result ? true : false;
  sendResponse(res, {
    message: isok ? 'Successfully set up profile ' : "something went wrong",
    code: isok ? 200 : 400,
    data: isok ? result : []
  })
});


export const SetUpProfileController = {
  SetUpProfile,
};
