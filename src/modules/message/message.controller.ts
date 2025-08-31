import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import pick from '../../shared/pick';
import sendResponse from '../../shared/sendResponse';
import { MessageService } from './message.service';
import { ChatService } from '../chat/chat.service';
import { IContent, IMessage, MessageType } from './message.interface';
import AppError from '../../errors/AppError';

const getAllMessagesByChatId = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['chatId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  if (!filters.chatId) {
    throw new AppError(StatusCodes.BAD_GATEWAY, 'Chat ID is required');
  }
  const result = await MessageService.getAllMessagesByChatId(filters, options);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Messages fetched successfully',
    data: result,
  });
});

const sendMessage = catchAsync(async (req, res) => {
  const senderId = req.user.userId;
  const { message, receiverId } = req.body;

  // Check if the chat already exists between the sender and receiver
  let chatId = null;

  const existingChat = await ChatService.checkSenderIdExistInChat(
    senderId,
    receiverId
  );
  if (existingChat) {
    chatId = existingChat.id;
  }

  // If chat doesn't exist, create a new one
  if (!existingChat) {
    const newChat = await ChatService.createSingleChat(senderId, receiverId);
    chatId = newChat._id;
  }

  // Payload for the message
  const content: IContent = {
    messageType: MessageType.TEXT,
    text: message,
  };

  // If a file is uploaded (image, audio, video, etc.), set the appropriate message type
  if (Array.isArray(req.files)) {
    req.files.forEach(file => {
      if (file.mimetype === 'image/jpeg') {
        content.messageType = MessageType.IMAGE;
      } else if (file.mimetype === 'audio/mpeg') {
        content.messageType = MessageType.AUDIO;
      } else if (file.mimetype === 'video/mp4') {
        content.messageType = MessageType.VIDEO;
      }
      content.fileUrl = `/uploads/messages/${file.filename}`;
      content.file = file; // Change req.file to file
      content.text = '';
    });
  }
  // Construct the message payload
  const payload: IMessage = {
    chatId,
    senderId,
    content,
    receiverId,
  };

  console.log(payload);
  // Send the message using the service
  const result = await MessageService.sendMessage(payload);

  // Send a success response with the created message data
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Message sent successfully',
    data: result,
  });
});

const markMessageSeen = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { messageId } = req.params;
  const result = await MessageService.markMessageSeen(messageId, userId);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Message marked as seen successfully',
    data: result,
  });
});

export const MessageController = {
  getAllMessagesByChatId,
  sendMessage,
  markMessageSeen,
};
