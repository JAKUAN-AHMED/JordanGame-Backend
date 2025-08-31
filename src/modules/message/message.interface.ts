import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../types/paginate';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export interface IContent {
  text?: string;
  messageType: MessageType;
  fileUrl?: string;
  file?: Record<string, any>;
}

export interface IMessage {
  _id?: string;
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: IContent;
  seenBy?: Types.ObjectId[];
  deletedBy?: Types.ObjectId[];
  unsentBy?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageModel extends Model<IMessage> {
  paginate(
    filter: Record<string, any>,
    options: PaginateOptions
  ): Promise<PaginateResult<IMessage>>;
}
