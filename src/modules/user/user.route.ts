import { SetUpProfileController } from './../profile/profile.controller';
import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';


import { upload } from '../../utils/uploadToaws';
// const UPLOADS_FOLDER = 'uploads/users';
// const upload = fileUploadHandler(UPLOADS_FOLDER);

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
  upload.single('file'),
  SetUpProfileController.SetUpProfile
);


//make admin
router.post(
  '/admin',
  auth('admin', 'superadmin'),
  UserController.createAdminOrSuperAdmin
);


export const UserRoutes = router;
