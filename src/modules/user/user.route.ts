import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../shared/fileUploadHandler';
import { Uploads_USER_FOLDER } from '../auth/auth.constant';

const upload = fileUploadHandler(Uploads_USER_FOLDER);

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

//update user account
router.patch(
  '/update-profile',
  upload.single('profileImage'),
  auth('common'),
  UserController.UpdateProfile
);

//user account
router
  .route('/account')
  .delete(auth('common'), UserController.deleteMyProfile) // DELETE /account
  .get(auth('common'), UserController.getMyProfile); // GET /account

//update user account status
router.patch(
  '/profile/status',
  auth('common'),
  UserController.ActivateDeactivateAccount
)  

//recover account
router.patch('/profile/recover', auth('admin'), UserController.recoverAccount);

//make admin
router.post('/admin', auth('admin'), UserController.createAdminOrSuperAdmin);

export const UserRoutes = router;
