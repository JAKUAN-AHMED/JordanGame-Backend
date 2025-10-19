import { Router } from "express";

// collections.routes.ts
const router=Router();


router.route('/')
.get()
.post()
.patch()
.delete()

export const CollectionsRoutes=router;
