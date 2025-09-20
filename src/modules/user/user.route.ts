import { SetUpProfileController } from './../profile/profile.controller';
import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';

import fileUploadHandler from '../../shared/fileUploadHandler';
import { USER_UPLOADS_FOLDER } from './user.constant';


const upload=fileUploadHandler(USER_UPLOADS_FOLDER);


const router = express.Router();

//main routes
router.route('/all-user').get(auth('common'), UserController.getAllUsers);

router
  .route('/single-user/:userId')
  .get(auth('common'), UserController.getSingleUser)



// Upload profile (with file)
router.post(
  '/profile/create',
  auth('common'),
  upload.single("file"),
  SetUpProfileController.SetUpProfile
);


//[profile]
router.route('/profile')
  .get(auth('common'), SetUpProfileController.myProfile)
  .patch(auth('common'),
    upload.single('file'),
    SetUpProfileController.updateProfile
  )
  .delete(auth('common'),SetUpProfileController.deleteProfile)

//make admin
router.patch(
  '/admin',
  auth('superadmin'),
  UserController.createAdminOrSuperAdmin
);


router.get('/overview/:year',auth('admin'),UserController.overview);

export const UserRoutes = router;
