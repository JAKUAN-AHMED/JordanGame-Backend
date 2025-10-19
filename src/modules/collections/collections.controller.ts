// collections.controller.ts

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { CollectionService } from "./collections.service";


const createCollection = catchAsync(async (req, res) => {
    const result = await CollectionService.createCollection(req.body);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Collection created successfully',
        data: result,
    });
});


const updateCollection = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CollectionService.updateCollection(id, req.body);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Collection updated successfully',
        data: result,
    });
});


const getAllCollection = catchAsync(async (req, res) => {
    const result = await CollectionService.getAllCollection(req.query,req.User.userId as string);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Collection fetched successfully',
        data: result,
    });
});

export const CollectionController = {
    createCollection,
    updateCollection,
    getAllCollection
};