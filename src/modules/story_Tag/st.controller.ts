import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TagServices } from "./st.service";

// Update entire tag array
const updateTagController = catchAsync(async (req, res) => {
    const result = await TagServices.updateTag(req.params.id, req.body);
    sendResponse(res, {
        code: 200,
        message: 'Tag updated successfully',
        data: result
    });
});

// Add new tags to existing array
const addTagsController = catchAsync(async (req, res) => {
    const { tags } = req.body; // Array of new tags
    const result = await TagServices.addTagsToArray(req.params.id, tags);
    sendResponse(res, {
        code: 200,
        message: 'Tags added successfully',
        data: result
    });
});

// Remove specific tags from array
const removeTagsController = catchAsync(async (req, res) => {
    const { tags } = req.body; // Array of tags to remove
    const result = await TagServices.removeTagsFromArray(req.params.id, tags);
    sendResponse(res, {
        code: 200,
        message: 'Tags removed successfully',
        data: result
    });
});

// Get all tags with pagination and search
const getAllTagsController = catchAsync(async (req, res) => {
    const result = await TagServices.getAllTags(req.query);
    sendResponse(res, {
        code: 200,
        message: 'Tags retrieved successfully',
        data: result
    });
});

// Get single tag
const getSingleTagController = catchAsync(async (req, res) => {
    const result = await TagServices.getSingleTag(req.params.id);
    sendResponse(res, {
        code: 200,
        message: 'Tag retrieved successfully',
        data: result
    });
});

// Delete single tag
const deleteTagController = catchAsync(async (req, res) => {
    const result = await TagServices.deleteTag(req.params.id);
    sendResponse(res, {
        code: 200,
        message: 'Tag deleted successfully',
        data: result
    });
});

// Delete multiple tags
const deleteMultipleTagsController = catchAsync(async (req, res) => {
    const { ids } = req.body; // Array of tag IDs
    const result = await TagServices.deleteMultipleTags(ids);
    sendResponse(res, {
        code: 200,
        message: result.message,
        data: { deletedCount: result.deletedCount }
    });
});


const createTagController = catchAsync(async (req, res) => {
    const result = await TagServices.createTag(req.body);
    
    sendResponse(res, {
        code: 201,
        message: 'Tag created successfully',
        data: result
    });
});
export const TagController={
    deleteMultipleTagsController,
    getAllTagsController,
    getSingleTagController,
    deleteTagController,
    addTagsController,
    updateTagController,
    removeTagsController,
    createTagController

}