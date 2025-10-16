import catchAsync from "../../../shared/catchAsync";
import { CSservice } from "./cs.service";

const createOrUpdateCS=catchAsync(async (req, res, next) => {
    const result = await CSservice.createOrUpdateCS(req.body);
    res.status(200).json({
        success: true,
        data: result,
    });
});

const getCS=catchAsync(async (req, res, next) => {
    const result = await CSservice.getCS();
    res.status(200).json({
        success: true,
        data: result,
    });
});


export const CSController = {
    createOrUpdateCS,
    getCS,
};