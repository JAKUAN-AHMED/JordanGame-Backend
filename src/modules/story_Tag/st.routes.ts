import { Router } from "express";
import { TagController } from "./st.controller";
import auth from "../../middlewares/auth";

const router=Router();


router.post('/create-tag',auth('admin'),TagController.createTagController);

router.route('/tags/:id')
.get(auth('common'),TagController.getSingleTagController)
.patch(auth('common'),TagController.updateTagController)
.delete(auth('admin'),TagController.deleteTagController)

router.get('/tags', auth('common'),TagController.getAllTagsController);     
router.patch('/tags/:id/add', auth('common'),TagController.addTagsController);   
router.delete('/tags',auth('admin'), TagController.deleteMultipleTagsController); 


export const TagRoutes=router;