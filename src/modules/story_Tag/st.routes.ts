import { Router } from "express";
import { TagController } from "./st.controller";
import auth from "../../middlewares/auth";

const router=Router();


router.post('/create-tag',auth('admin'),TagController.createTagController);

router.route('/tags/:id')
.get(auth('common'),TagController.getSingleTagController)
.put(auth('common'),TagController.updateTagController)
.delete(auth('common'),TagController.deleteTagController)

router.get('/tags', TagController.getAllTagsController);     
router.patch('/tags/:id/add', TagController.addTagsController);    // PATCH add tags
router.patch('/tags/:id/remove', TagController.removeTagsController); // PATCH remove tags 
router.delete('/tags', TagController.deleteMultipleTagsController); // DELETE multiple


export const TagRoutes=router;