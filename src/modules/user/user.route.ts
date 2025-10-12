import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { UserValidation } from './user.validation';



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





//recover account
router.patch('/profile/recover', auth('admin'), UserController.recoverAccount);

//make admin
router.post(
  '/admin', 
  auth('admin'),
  UserController.createAdminOrSuperAdmin
);



export const UserRoutes = router;
