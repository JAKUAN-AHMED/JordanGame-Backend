import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AuthService } from './auth.service';
import AppError from '../../errors/AppError';
import { TokenService } from '../token/token.service';
import { TUser } from '../user/user.interface';

// register
const register = catchAsync(async (req, res) => {
  const result = await AuthService.createUser(req.body);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'User created successfully, please verify your email',
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  //set refresh token in cookie
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // set maxAge to a number
    sameSite: 'lax',
  });

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User logged in successfully',
    data: result,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const {userId} = req.User;
  const { email, token, otp } = req.body;
  const result = await AuthService.verifyEmail(email, token, otp);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Email verified successfully',
    data: {
      result,
    },
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.resendOtp(email);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Otp sent successfully',
    data: result,
  });
});
const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password reset email sent successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  if (!req.User || typeof (req.User as any).userId === 'undefined') {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }
  const { userId } = req.User as { userId: string };
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(
    userId,
    currentPassword,
    newPassword,
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password changed successfully',
    data: result,
  });
});
const resetPassword = catchAsync(async (req, res) => {
  const { email, password, otp } = req.body;
  const result = await AuthService.resetPassword(email, password, otp);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password reset successfully',
    data: {
      result,
    },
  });
});

const logout = catchAsync(async (req, res) => {
  if(!req.body.refreshToken){
    throw new AppError(404,'Token Not Found');
  }
  await AuthService.logout(req.body.refreshToken);
  console.log('hitted 2');
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User logged out successfully',
    data: {},
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await AuthService.refreshToken(refreshToken);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // set maxAge to a number
    sameSite: 'lax',
  });
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Refresh token generated successfully',
    data: result,
  });
});


//SOCIAL

const googleCallback = catchAsync(async (req, res) => {
  const user = req.user;
  console.log("user",user);
  const tokens = await TokenService.accessAndRefreshToken(user as TUser);

  sendResponse(res,{
    message:`Welcome Home`,
    code:200,
    data:{user,tokens}
  })
});

const facebookCallback =catchAsync (async (req, res) => {
  const user = req.user;
  const tokens = await TokenService.accessAndRefreshToken(user as TUser);

  sendResponse(res,{
    message:`Welcome Home`,
    code:200,
    data:{user,tokens}
  })
});
export const AuthController = {
  register,
  login,
  verifyEmail,
  resendOtp,
  logout,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  googleCallback,
  facebookCallback
};
