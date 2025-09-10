import { Router } from "express";
import auth from "../../middlewares/auth";
import { SharedStoryListController } from "./shs.controller";


const router=Router();


//send story
router.route('/share')
.post(auth('common'),SharedStoryListController.createSharedStoryList)
.get(auth('admin'),SharedStoryListController.SharedStoryList)



//single
router.route('/share/:id')
.get(auth('admin'),SharedStoryListController.SingleShareList) 
.delete(auth('admin'),SharedStoryListController.DeleteSharedList) 

export const ShareStoryListRoutes=router;