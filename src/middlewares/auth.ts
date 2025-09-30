import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { roleRights } from './roles';
import { User } from '../modules/user/user.model';
import AppError from '../errors/AppError';
import catchAsync from '../shared/catchAsync';
import { config } from '../config';
import { TokenType } from '../modules/token/token.interface';
import { TokenService } from '../modules/token/token.service';

const auth = (...roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Step 1: Get Authorization Header
    const tokenWithBearer = req.headers.authorization?.split(' ')[1];
    if (!tokenWithBearer) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }
    const verifyUser = await TokenService.verifyToken(
      tokenWithBearer,
      (config.jwt.accessSecret as Secret)
        ? config.jwt.accessSecret
        : config.jwt.refreshSecret,
      TokenType.ACCESS ? TokenType.ACCESS : TokenType.REFRESH
    );
    // Step 3: Attach user to the request object
    req.User= verifyUser;
    
    // Step 4: Check if the user exists and is active
    const user = await User.findById(verifyUser.userId);
    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User not found.');
    } else if (!user.isEmailVerified) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Your account is not verified.'
      );
    }

    // Step 5: Role-based Authorization
    if (roles.length) {
      const userRole = roleRights.get(verifyUser?.role);
      const hasRole = userRole?.some(role => roles.includes(role));
      if (!hasRole) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this API"
        );
      }
      next();
    } else {
      // If the token format is incorrect
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }
  });

export default auth;
