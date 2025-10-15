import { StatusCodes } from 'http-status-codes';
import { ContentService } from './content.service';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { uploadSingleFileToS3 } from '../../helpers/S3Service';
import { Uploads_CONTENT_FOLDER } from './content.constant';

const createContent = catchAsync(async (req, res) => {
    let imgUrl: string | null = null;
    if (req.file) {
        imgUrl = await uploadSingleFileToS3(req.file, Uploads_CONTENT_FOLDER);
    }
    req.body.imgUrl = imgUrl;

    const result = await ContentService.createContent(req.body);
    sendResponse(res, {
        code: StatusCodes.CREATED,
        message: 'Content created successfully',
        data: result,
    });
});

const getAllContent = catchAsync(async (req, res) => {
    const result = await ContentService.getAllContent(req.query);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Contents fetched successfully',
        data: result,
    });
});

const getContentById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ContentService.getContentById(id);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Content fetched successfully',
        data: result,
    });
});

const updateContent = catchAsync(async (req, res) => {
    const { id } = req.params;

    let imgUrl: string | null = null;
    if (req.file) {
        imgUrl = await uploadSingleFileToS3(req.file, Uploads_CONTENT_FOLDER);
        req.body.imgUrl = imgUrl;
    }

    const result = await ContentService.updateContent(id, req.body);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Content updated successfully',
        data: result,
    });
});

const deleteContent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ContentService.deleteContent(id);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: 'Content deleted successfully',
        data: result,
    });
});

const getContentByCategory = catchAsync(async (req, res) => {
    const { category } = req.params;
    const result = await ContentService.getContentByCategory(category);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: `${category} contents fetched successfully`,
        data: result,
    });
});

const getContentByStatus = catchAsync(async (req, res) => {
    const { status } = req.params;
    const result = await ContentService.getContentByStatus(status);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: `${status} contents fetched successfully`,
        data: result,
    });
});

export const ContentController = {
    createContent,
    getAllContent,
    getContentById,
    updateContent,
    deleteContent,
    getContentByCategory,
    getContentByStatus,
};
