import { Router } from "express";
import multer from "multer";
import { storyController } from "./story.controller";
import auth from "../../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload",auth('common'), upload.single("file"), storyController.uploadStory);
router.get("/stories", storyController.getStories);

export const StoryRoutes=router;
