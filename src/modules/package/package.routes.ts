import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../shared/validateRequest";
import { createPackageValidationSchema, updatePackageValidationschema } from "./package.validation";
import { packageController } from "./package.controller";

// package.routes.ts
const router=Router();

//package create,get all

router.route('/')
.get(auth('common'),packageController.getAllPackage)
.post(auth('admin'),validateRequest(createPackageValidationSchema),packageController.createPackage);

//single package
router.route('/:id')
.get(auth('common'),packageController.getSinglePackage)
.patch(auth('admin'),validateRequest(updatePackageValidationschema),packageController.updatePackage)
.delete(auth('admin'),packageController.deletePackage)
export const PackageRoutes=router;