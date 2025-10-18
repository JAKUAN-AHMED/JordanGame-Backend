import moment from 'moment';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { OtpService } from '../otp/otp.service';
import { User } from '../user/user.model';
import bcrypt from 'bcrypt';
import { TUser } from '../user/user.interface';
import { config } from '../../config';
import { TokenService } from '../token/token.service';
import { TokenType } from '../token/token.interface';
import { OtpType } from '../otp/otp.interface';

import { Token } from '../token/token.model';
import validator from 'validator';



const createUser = async (userData: TUser) => {
  const existingUser = await User.findOne({ email: userData.email });


  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email already taken');
    } else {
      await User.findOneAndUpdate({ email: userData.email }, userData);

      //create verification email token
      const verificationToken = await TokenService.createVerifyEmailToken(
        existingUser
      );
      //create verification email otp
     const otpDoc= await OtpService.createVerificationEmailOtp(existingUser.email);
      return { verificationToken,otp:otpDoc.otp };
    }
  }

  const email = userData?.email;

  if (validator.isEmail(email)) {
    console.log('✅ Valid email format');
  } else {
    console.log('❌ Invalid email format');
  }

  // console.log('userData', userData);
  const user = await User.create(userData);
  const { password, ...rest } = user.toObject();

  //create verification email token
  const verificationToken = await TokenService.createVerifyEmailToken(user);
  //create verification email otp
  const otopDoc=await OtpService.createVerificationEmailOtp(user.email);
  return { verificationToken,otp:otopDoc.otp,userData:rest };
};

const login = async (email: string, reqpassword: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new AppError(403, 'Please verify email first before login');
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Account is locked. Try again after ${config.auth.lockTime} minutes`
    );
  }

  const isPasswordValid = await bcrypt.compare(
    reqpassword,
    user?.password as string
  );
  if (!isPasswordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= config.auth.maxLoginAttempts) {
      user.lockUntil = moment().add(config.auth.lockTime, 'minutes').toDate();
      await user.save();
      throw new AppError(
        423,
        `Account locked for ${config.auth.lockTime} minutes due to too many failed attempts`
      );
    }
    await user.save();
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  if (user.failedLoginAttempts > 0) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  const tokens = await TokenService.accessAndRefreshToken(user);
  const { password, ...userWithoutPassword } = user.toObject();
  return {
    userWithoutPassword,
    tokens,
  };
};

const verifyEmail = async (email: string, token: string, otp: string) => {
  console.log('email - token - otp', email, token, otp);
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  await TokenService.verifyToken(
    token,
    config.token.TokenSecret,
    user?.isResetPassword ? TokenType.RESET_PASSWORD : TokenType.VERIFY
  );

  //verify otp
  await OtpService.verifyOTP(
    user.email,
    otp,
    user?.isResetPassword ? OtpType.RESET_PASSWORD : OtpType.VERIFY
  );

  user.isEmailVerified = true;
  user.isResetPassword = false;

  await user.save();

  const tokens = await TokenService.accessAndRefreshToken(user);
  return tokens;
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  //create reset password token
  const resetPasswordToken = await TokenService.createResetPasswordToken(user);
 const otopDoc=await OtpService.createResetPasswordOtp(user.email);
  user.isResetPassword = true;
  await user.save();
  return { resetPasswordToken,otp:otopDoc.otp };
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user?.isResetPassword) {
    const resetPasswordToken = await TokenService.createResetPasswordToken(
      user
    );
    await OtpService.createResetPasswordOtp(user.email);
    return { resetPasswordToken };
  }
  const verificationToken = await TokenService.createVerifyEmailToken(user);
  await OtpService.createVerificationEmailOtp(user.email);
  return { verificationToken };
};

const resetPassword = async (
  email: string,
  password: string,
  confirmpassword: string
) => {
  if(password != confirmpassword) {
    throw new AppError(403, 'Password and confirm pass not matched');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!user.isEmailVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Please verify your email first');
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt.saltRounds)
  )
  user.isResetPassword = false;
  const userData = await User.findByIdAndUpdate(
    user._id,
    { $set: { password: hashedPassword, isResetPassword: false } },
    { new: true, select: '-password' }
  );

  if (!userData) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return userData;
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user?.password as string
  );

  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};
const logout = async (accessToken?: string, refreshToken?: string) => {
  // Delete all tokens for the user to ensure complete logout
  const deletePromises = [];

  if (accessToken) {
    deletePromises.push(Token.findOneAndDelete({ token: accessToken, type: TokenType.ACCESS }));
  }

  if (refreshToken) {
    deletePromises.push(Token.findOneAndDelete({ token: refreshToken, type: TokenType.REFRESH }));
  }

  const results = await Promise.all(deletePromises);

  // Check if at least one token was deleted
  const hasDeleted = results.some(result => result !== null);

  if (!hasDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid token or already logged out');
  }

  return { message: 'User logged out successfully' };
};

const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token is required');
  }
  const decoded = await TokenService.verifyToken(
    refreshToken,
    config.jwt.refreshSecret,
    TokenType.REFRESH
  );
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const tokens = await TokenService.accessAndRefreshToken(user);
  return tokens;
};

export const AuthService = {
  createUser,
  login,
  verifyEmail,
  resetPassword,
  forgotPassword,
  resendOtp,
  logout,
  changePassword,
  refreshToken,
};
