import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { PaginateOptions, PaginateResult } from '../../types/paginate';
import { User } from '../user/user.model';
import { IChat } from './chat.interface';
import Chat from './chat.model';

const getAllChatsByUserId = async (
  filters: Record<string, any>,
  options: PaginateOptions
): Promise<PaginateResult<IChat>> => {
  const query: Record<string, any> = {
    participants: { $all: [filters.senderId] },
  };

  if (filters.chatName) {
    query.chatName = { $regex: filters.chatName, $options: 'i' };
  }
  options.populate = [
    {
      path: 'participants',
      select: 'first_name last_name email profile_picture isOnline',
    },
    {
      path: 'lastMessage',
      select: 'senderId content',
      populate: {
        path: 'senderId',
        select: 'first_name last_name email profile_picture isOnline',
      },
    },
  ];
  options.sortBy = options.sortBy || 'lastMessage.timestamp';
  const result = await Chat.paginate(query, options);
  return result;
};

const getChatById = async (chatId: string): Promise<IChat | null> => {
  return Chat.findById(chatId)
    .populate(
      'participants',
      'first_name last_name email profile_picture isOnline'
    )
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'senderId',
        select: 'first_name last_name email profile_picture isOnline',
      },
    })
    .lean();
};

const checkSenderIdExistInChat = async (
  senderId: string,
  receiverId: string
) => {
  //chekc
  const chat = await Chat.findOne({
    chatType: 'single',
    participants: { $all: [senderId, receiverId] },
  });
  return chat;
};
const createSingleChat = async (
  senderId: string,
  receiverId: string
): Promise<IChat> => {
  // check receiver user exist in database
  const receiverUser = await User.findById(receiverId);
  if (!receiverUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Receiver user not found');
  }
  const existingChat = await Chat.findOne({
    chatType: 'single',
    participants: { $all: [senderId, receiverId] },
  }).lean();

  if (existingChat) {
    return existingChat;
  }

  const newChat = new Chat({
    chatType: 'single',
    participants: [senderId, receiverId],
  });
  const savedChat = await newChat.save();
  return savedChat.toObject();
};

const createGroupChatService = async (
  chatName: string,
  participantIds: string[],
  groupAdmin: string
) => {
  const newChat = new Chat({
    chatType: 'group',
    chatName,
    participants: [groupAdmin, ...participantIds],
    groupAdmin,
  });
  const savedChat = await newChat.save();
  return savedChat.toObject();
};

export const ChatService = {
  getAllChatsByUserId,
  getChatById,
  createSingleChat,
  createGroupChatService,
  checkSenderIdExistInChat,
};
