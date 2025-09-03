import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../shared/validateRequest';
import { UserValidation } from '../user/user.validation';
import { AuthValidation } from './auth.validations';
import auth from '../../middlewares/auth';
import passport from 'passport';

const router = Router();
router.post(
  '/register',
  validateRequest(UserValidation.createUserValidationSchema),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post('/resend-otp', AuthController.resendOtp);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post(
  '/change-password',
  auth('common'),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.verifyEmailValidationSchema),
  AuthController.verifyEmail,
);

router.post('/logout', AuthController.logout);

router.post('/refresh-token', AuthController.refreshToken);

//social login


// Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  AuthController.googleCallback
);

// Facebook login
// router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { session: false, failureRedirect: "/login" }),
//   AuthController.facebookCallback
// );

export const AuthRoutes = router;
