import { SetUpProfileController } from './../profile/profile.controller';
import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../shared/fileUploadHandler';
import convertHeicToPngMiddleware from '../../shared/convertHeicToPngMiddleware';

import { upload } from '../../utils/uploadToaws';
// const UPLOADS_FOLDER = 'uploads/users';
// const upload = fileUploadHandler(UPLOADS_FOLDER);

const router = express.Router();

//main routes
router.route('/all-user').get(auth('common'), UserController.getAllUsers);

router
  .route('/single-user/:userId')
  .get(auth('common'), UserController.getSingleUser)
  .patch(
    auth('admin'),
    validateRequest(UserValidation.changeUserStatusValidationSchema),
    UserController.updateUserStatus
  );

router
  .route('/profile')
  .patch(auth('common'), UserController.ActivateDeactivateAccount) // PATCH /profile
  .delete(auth('common'), UserController.deleteMyProfile) // DELETE /profile
  .get(auth('common'), UserController.getMyProfile); // GET /profile

// Separate route for updating profile
router.patch(
  '/profile/update',
  auth('common'),
  upload.single('profileImg'),
  SetUpProfileController.updateProfile
);

// Upload profile (with file)
router.post(
  '/profile/create',
  auth('common'),
  upload.single('file'),
  SetUpProfileController.SetUpProfile
);

//verify profile
router
  .route('/verify-profile')
  .post(
    auth('common'),
    upload.single('selfieImg'),
    SetUpProfileController.uploadImageForVerification
  )
  .patch(auth('admin'), SetUpProfileController.VerifyProfile);

//recover account
router.patch('/profile/recover', auth('admin'), UserController.recoverAccount);

//make admin
router.post(
  '/admin',
  auth('admin', 'superadmin'),
  UserController.createAdminOrSuperAdmin
);

// For all countries (list + create)
router
  .route('/country')
  .get(auth('admin'), SetUpProfileController.getCountry)
  .post(auth('admin'), SetUpProfileController.createCountry);

// For single country (get + update + delete by id)
router
  .route('/country/:id')
  .get(auth('admin'), SetUpProfileController.singleCountry)
  .patch(auth('admin'), SetUpProfileController.updateCountry)
  .delete(auth('admin'), SetUpProfileController.deleteCountry);

export const UserRoutes = router;
