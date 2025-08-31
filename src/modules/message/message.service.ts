import { StatusCodes } from 'http-status-codes';
import { PaginateOptions, PaginateResult } from '../../types/paginate';
import Chat from '../chat/chat.model';
import { IMessage } from './message.interface';
import Message from './message.model';

const getAllMessagesByChatId = async (
  filter: Record<string, any>,
  options: PaginateOptions
): Promise<PaginateResult<IMessage>> => {
  options.populate = [
    {
      path: 'senderId',
      select: 'first_name last_name email profile_picture isOnline',
    },
  ];
  options.sortBy = options.sortBy || 'createdAt';
  const result = await Message.paginate(filter, options);
  return result;
};

const sendMessage = async (payload: IMessage): Promise<IMessage> => {
  const newMessage = await Message.create(payload);
  // Update last message in chat
  const chat = await Chat.findById(payload.chatId);

  if (chat) {
    chat.lastMessage = newMessage.id;
    await chat.save();
  }
  //send socket messate  to message
  const messageEvent = `${payload.chatId}::${payload.receiverId}`;
  //@ts-ignore
  io.emit(messageEvent, {
    code: StatusCodes.OK,
    message: 'Message sent successfully',
    data: newMessage,
  });

  //sent socket to chat
  const chatEvent = `${payload.senderId}::${payload.receiverId}`;
  //@ts-ignore
  io.emit(chatEvent, {
    code: StatusCodes.OK,
    message: 'Updated chat sent successfully',
    data: newMessage,
  });
  return newMessage;
};

const markMessageSeen = async (messageId: string, userId: string) => {
  return Message.findByIdAndUpdate(messageId, {
    $addToSet: { seenBy: userId },
  });
};

const markMessageDeleted = async (messageId: string, userId: string) => {
  const message = await Message.findByIdAndUpdate(messageId, {
    $addToSet: { deletedBy: userId },
  });
  const updateMessageEvent = `${message?.chatId}::${message?.receiverId}`;
  //@ts-ignore
  io.emit(updateMessageEvent, {
    code: StatusCodes.OK,
    message: 'Message deleted successfully',
    data: message,
  });
  return message;
};

const markMessageUnsent = async (messageId: string, userId: string) => {
  return Message.findByIdAndUpdate(messageId, {
    $addToSet: { unsentBy: userId },
  });
};

export const MessageService = {
  getAllMessagesByChatId,
  sendMessage,
  markMessageSeen,
  markMessageDeleted,
  markMessageUnsent,
};
