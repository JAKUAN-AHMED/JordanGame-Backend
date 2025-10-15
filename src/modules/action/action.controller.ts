// action.controller.ts

import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ActionService } from "./action.service";


const ActionOnUser=catchAsync(async (req, res, next) => {
    const result = await ActionService.ActionOnUser(req.params.id, req.body.action);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: `User status changed into ${req.body.action} successfully`,
        data: result,
    });
});

const UserDisabledAcountorEnabaled=catchAsync(async (req, res, next) => {
    const result = await ActionService.UserDisabledAcountorEnabaled(req.params.id);
    sendResponse(res, {
        code: StatusCodes.OK,
        message: `User status changed into ${req.body.action} successfully`,
        data: result,
    });
});


export const ActionController = {
    ActionOnUser,
    UserDisabledAcountorEnabaled,
};