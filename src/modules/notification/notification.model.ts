import { model, Schema } from 'mongoose';
import { INotification, INotificationModal } from './notification.interface';
import paginate from '../../common/plugins/paginate';
import { Roles } from '../../middlewares/roles';

const notificationModel = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'User is required'],
    },
    role: {
      type: String,
      enum: Roles,
      required: true,
    },
    image: {
      type: String,
    },
    linkId: {
      type: String,
    },
    senderId:{
      type:Schema.Types.ObjectId,ref:"User"
    },
    viewStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationModel.plugin(paginate);

export const Notification = model<INotification, INotificationModal>(
  'Notification',
  notificationModel
);
