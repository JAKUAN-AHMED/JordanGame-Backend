import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.services';
import catchAsync from '../../shared/catchAsync';
import pick from '../../shared/pick';
import sendResponse from '../../shared/sendResponse';
import { notificationFilters } from './notification.constants';
import { Role } from '../user/user.constant';

const getALLNotification = catchAsync(async (req, res) => {
  const filters = pick(req.query, notificationFilters);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const userId = req.User.id;
  const result = await NotificationService.getALLNotification(
    filters,
    options,
    userId
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notifications fetched successfully',
  });
});

const getAdminNotifications = catchAsync(async (req, res) => {
  const filters = pick(req.query, notificationFilters);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await NotificationService.getAdminNotifications(
    filters,
    options
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Admin Notifications fetched successfully',
  });
});

const getSingleNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.getSingleNotification(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notification fetched successfully',
  });
});

const viewNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationService.viewNotification(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Notification viewed successfully',
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NotificationService.deleteNotification(id);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Notification deleted successfully',
    data: {},
  });
});

const clearAllNotification = catchAsync(async (req, res) => {
  const userId = req.User.id;
  await NotificationService.clearAllNotification(userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'All notifications cleared successfully',
    data: {},
  });
});

const addCsNotification = catchAsync(async (req, res) => {
  const eventName = req.body.eventName;
  const userId = req.User.userId as string;
  const notification = {
    receiverId: req.body.receiverId,
    title: req.body.title,
    senderId: userId,
    role: req.body.role as Role,
  };
  sendResponse(res, {
    message: 'new notificaiton arrived ',
    code: 200,
    data: await NotificationService.addCustomNotification(
      eventName,
      notification,
      userId
    ),
  });
});

const addNotification = catchAsync(async (req, res) => {
  req.body.senderId=req.User.userId as string;
  sendResponse(res, {
    message: 'Successfully send notification ',
    code: 200,
    data: await NotificationService.addNotification(req.body),
  });
});
export const NotificationController = {
  getALLNotification,
  getAdminNotifications,
  getSingleNotification,
  viewNotification,
  deleteNotification,
  clearAllNotification,
  addCsNotification,
  addNotification
};
