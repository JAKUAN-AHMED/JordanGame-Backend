import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { TransactionService } from './Transactions.service';

// Transactions.controller.ts
const makePayment = catchAsync(async (req, res) => {
  req.body.user = req.User.userId;
  const result = await TransactionService.makePayment(req.body);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Transaction created successfully',
    data: result ? result : {},
  });
});

const getAllTransaction = catchAsync(async (req, res) => {
  const result = await TransactionService.getAllTransaction(req.query);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Transactions fetched successfully',
    data: result && result.data.length > 0 ? result : [],
  });
});

const getMyTransaction = catchAsync(async (req, res) => {
  const result = await TransactionService.getMyTransaction(req.User.userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Transactions fetched successfully',
    data: result && result.length > 0 ? result : [],
  });
});

const getSingleTransaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TransactionService.singleTransaction(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Transaction fetched successfully',
    data: result ? result : {},
  });
});

export const TransactionController = {
  makePayment,
  getAllTransaction,
  getMyTransaction,
  getSingleTransaction,
};
