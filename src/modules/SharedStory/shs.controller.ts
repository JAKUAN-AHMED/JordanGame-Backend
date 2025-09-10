import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { SharedStoryServices } from './shs.service';

const createSharedStoryList = catchAsync(async (req, res) => {
  req.body.sender = req.User.userId;
  sendResponse(res, {
    message: 'Successfully Shared A Story',
    code: 201,
    data: await SharedStoryServices.createSharedStoryList(req.body),
  });
});

const SharedStoryList = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully Retrieved SharedList ',
    code: 200,
    data: await SharedStoryServices.SharedStoryList(req.query),
  });
});
const SingleShareList = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully Retrieved a SharedList ',
    code: 200,
    data: await SharedStoryServices.SingleShareList(req.params.id),
  });
});
const DeleteSharedList = catchAsync(async (req, res) => {
  sendResponse(res, {
    message: 'Successfully Deleted a SharedList ',
    code: 200,
    data: await SharedStoryServices.DeleteSharedList(req.params.id),
  });
});


export const SharedStoryListController={
    createSharedStoryList,
    DeleteSharedList,
    SingleShareList,
    SharedStoryList
}
