// Transactions.routes.ts

import { Router } from 'express';
import auth from '../../middlewares/auth';
import { TransactionController } from './Transactions.controller';

const router = Router();

//make payment
router
  .route('/make-payment')
  .post(auth('common'), TransactionController.makePayment);

//get my transaction
router
  .route('/my-transaction')
  .get(auth('common'), TransactionController.getMyTransaction);

//get all transaction
router
  .route('/all-transaction')
  .get(auth('admin'), TransactionController.getAllTransaction);


//single transaction
router
  .route('/single-transaction/:id')
  .get(auth('common'), TransactionController.getSingleTransaction);



export const TransactionRotues = router;
