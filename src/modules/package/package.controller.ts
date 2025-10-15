import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import { packageService } from './package.service';
import sendResponse from '../../shared/sendResponse';

// package.controller.ts
const createPackage = catchAsync(async (req, res) => {
  const result = await packageService.createPackage(req.body);
  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Package created successfully',
    data: result,
  });
});

const getAllPackage = catchAsync(async (req, res) => {
  const result = await packageService.getAllPackage(req.query);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Packages fetched successfully',
    data: result,
  });
});

const getSinglePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await packageService.singlePackage(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Package fetched successfully',
  });
});

const updatePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await packageService.updatePackage(id, req.body);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Package updated successfully',
    data: result,
  });
});

const deletePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await packageService.deletePackage(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Package deleted successfully',
    data: result,
  });
});

export const packageController = {
  createPackage,
  getAllPackage,
  getSinglePackage,
  updatePackage,
  deletePackage,
};