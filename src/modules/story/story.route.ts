import { Router } from "express";
import { storyController } from "./story.controller";
import auth from "../../middlewares/auth";
import fileUploadHandler from "../../shared/fileUploadHandler";
import { STORY_UPLOADS_FOLDER } from "./stroy.constant";




const router = Router();
const upload = fileUploadHandler(STORY_UPLOADS_FOLDER);


const uploadMiddleware =upload.fields([
    { name: 'files', maxCount: 10 },  // images
    { name: 'files', maxCount: 1 },// video/audio
    { name: 'thumbnail', maxCount: 1 } //thumbnail
]);
router.route('/story')
    .post(auth('common'), uploadMiddleware,storyController.uploadStory)
    .get(auth('common'), storyController.getLatestStories)
    


router.route('/stories')
    .get(auth('common'), storyController.getMyStories)


//every story begins with a step
router.get('/story-steps', auth('common'), storyController.GetStorySteps);    

router.get('/libraryData', auth('common'), storyController.librayAudioData);


router.route('/story/:id')
    .delete(auth('common'), storyController.deleteMyStory)
    .patch(auth('common'), storyController.updateMyStory)
    .get(auth('common'), storyController.singleStory)

//VIEW COUNT
router.patch('/story/:id/view', auth('common'), storyController.viewCountForMedia);

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
