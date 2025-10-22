import { Router } from "express";
import { CollectionController } from "./collections.controller";
import auth from "../../middlewares/auth";

// collections.routes.ts
const router=Router();


router.route('/')
.post(auth('common'),CollectionController.createCollection)
.get(auth('common'),CollectionController.getAllMyCollection)

router.route('/:id')
.patch(auth('common'),CollectionController.updateCollection)



export const CollectionsRoutes=router;
