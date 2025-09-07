import { Router } from "express";
import { storyController } from "./story.controller";
import auth from "../../middlewares/auth";
import { upload } from "../../helpers/File/FileUpload";
import validateRequest from "../../shared/validateRequest";



const router = Router();


router.route('/story')
.post(auth('common'),upload.array('file'),storyController.uploadStory)
.get(auth('common'),storyController.getLatestStories)


router.route('/stories')
.get(auth('common'),storyController.getMyStories)

router.get('/libraryData',auth('common'),storyController.librayAudioData);


router.route('/story/:id')
.delete(auth('common'),storyController.deleteMyStory)
.patch(auth('common'),storyController.updateMyStory)


//bookmark routes

router.route('/bookmark')
.post(auth('common'),storyController.createBookmark)
.get(auth('common'),storyController.getSingleMyBookmark)
.delete(auth('common'),storyController.deleteBookmark)


router.get('/all-bookmark',auth('common'),storyController.getAllMyBookmark)

export const StoryRoutes = router;
