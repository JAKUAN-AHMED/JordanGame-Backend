import { Router } from "express";
import auth from "../../middlewares/auth";
import { ActionController } from "./action.controller";

// action.routes.ts
const router=Router();


// action.routes.ts

router.patch('/admin/:id',auth('admin'),ActionController.ActionOnUser);
router.patch('/user/:id',auth('common'),ActionController.UserDisabledAcountorEnabaled);

export const ActionRoutes=router;