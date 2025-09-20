import { Router } from "express";
import { storyController } from "./story.controller";
import auth from "../../middlewares/auth";
import fileUploadHandler from "../../shared/fileUploadHandler";
import { STORY_UPLOADS_FOLDER } from "./stroy.constant";




const router = Router();
const upload = fileUploadHandler(STORY_UPLOADS_FOLDER);


const uploadMiddleware =upload.fields([
    { name: 'files', maxCount: 10 },  // images
    { name: 'file', maxCount: 1 }     // video/audio
]);
router.route('/story')
    .post(auth('common'), uploadMiddleware,storyController.uploadStory)
    .get(auth('common'), storyController.getLatestStories)
    


router.route('/stories')
    .get(auth('common'), storyController.getMyStories)

router.get('/libraryData', auth('common'), storyController.librayAudioData);


router.route('/story/:id')
    .delete(auth('common'), storyController.deleteMyStory)
    .patch(auth('common'), storyController.updateMyStory)


//bookmark routes

router.route('/bookmark')
    .post(auth('common'), storyController.createBookmark)
    .get(auth('common'), storyController.getSingleMyBookmark)
    .delete(auth('common'), storyController.deleteBookmark)

//working days api
router.get('/working-days',auth('common'),storyController.workingDaysStories);


router.get('/all-bookmark', auth('common'), storyController.getAllMyBookmark)
router.get('/bookmarks/admin', auth('admin'), storyController.getAllBookmark)



router.get('/all-stories',auth('admin'),storyController.getAllStories);
export const StoryRoutes = router;
