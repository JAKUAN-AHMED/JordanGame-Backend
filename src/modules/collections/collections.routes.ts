import { Router } from "express";
import { CollectionController } from "./collections.controller";

// collections.routes.ts
const router=Router();


router.route('/')
.post(CollectionController.createCollection)
.get(CollectionController.getAllMyCollection)

router.route('/:id')
.patch(CollectionController.updateCollection)



export const CollectionsRoutes=router;
