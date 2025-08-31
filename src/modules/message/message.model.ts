import mongoose, { Schema, Document } from 'mongoose';
import { IMessage, IMessageModel, MessageType } from './message.interface';
import paginate from '../../common/plugins/paginate';

const messageSchema = new Schema<IMessage, IMessageModel>(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Chat ID is required'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
    },
    content: {
      type: {
        messageType: {
          type: String,
          enum: [
            MessageType.TEXT,
            MessageType.IMAGE,
            MessageType.AUDIO,
            MessageType.VIDEO,
          ],
          required: [true, 'Type is required'],
          default: MessageType.TEXT,
        },
        text: String,
        fileUrl: String,
        file: Object,
      },
      required: [true, 'Content is required'],
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    unsentBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

messageSchema.plugin(paginate);
const Message = mongoose.model<IMessage, IMessageModel>(
  'Message',
  messageSchema
);
export default Message;
