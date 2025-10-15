import express from 'express';

import auth from '../../middlewares/auth';
import { ContentController } from './content.controller';
import validateRequest from '../../shared/validateRequest';
import { ContentValidation } from './content.validation';
import fileUploadHandler from '../../shared/fileUploadHandler';
import { Uploads_CONTENT_FOLDER } from './content.constant';

const upload = fileUploadHandler(Uploads_CONTENT_FOLDER);

const router = express.Router();

// Create new content (Admin only)
router.post(
    '/',
    upload.single('image'),
    auth('admin'),
    validateRequest(ContentValidation.createContentValidationSchema),
    ContentController.createContent
);

// Get all content (with optional category filter via query param)
// Example: GET /content?category=skin
router.get(
    '/',
    auth('common'),
    ContentController.getAllContent
);

// Get content by category
// Example: GET /content/category/skin
router.get(
    '/category/:category',
    auth('common'),
    ContentController.getContentByCategory
);

// Get content by status
// Example: GET /content/status/active
router.get(
    '/status/:status',
    auth('common'),
    ContentController.getContentByStatus
);

// Get single content by ID
router.get(
    '/:id',
    auth('common'),
    ContentController.getContentById
);

// Update content by ID (Admin only)
router.patch(
    '/:id',
    upload.single('image'),
    auth('admin'),
    validateRequest(ContentValidation.updateContentValidationSchema),
    ContentController.updateContent
);

// Delete content by ID (Admin only)
router.delete(
    '/:id',
    auth('admin'),
    ContentController.deleteContent
);

export const ContentRoutes = router;
