// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) { }

  async saveMessage(senderId: string, recipientId: string, message: string, fileUrl?: string): Promise<Message> {
    const newMessage = new this.messageModel({
      senderId,
      recipientId,
      message,
      fileUrl,
      timestamp: new Date(),
    });
    return newMessage.save();
  }

  async getMessages(senderId: string, recipientId: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId },
        ],
      })
      .sort({ timestamp: 1 })
      .exec();
  }

  async getChatRooms(userId: string): Promise<any[]> {
    const messages = await this.messageModel
      .aggregate([
        {
          $match: {
            $or: [{ senderId: userId }, { recipientId: userId }],
          },
        },
        {
          $sort: { timestamp: -1 }, // Sắp xếp theo thời gian giảm dần
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$recipientId",
                "$senderId",
              ],
            },
            lastMessage: { $first: "$$ROOT" }, // Lấy tin nhắn cuối cùng
          },
        },
        {
          $project: {
            participantId: "$_id",
            lastMessageText: "$lastMessage.message",
            lastMessageTimestamp: "$lastMessage.timestamp",
            senderId: "$lastMessage.senderId",
          },
        },
      ])
      .exec();

    // Giả sử bạn có một cách lấy thông tin user (tạm hardcode hoặc gọi API khác)
    const chatRooms = await Promise.all(
      messages.map(async (room) => {
        const userReceiver = await this.getUserInfo(room.participantId); // Thay bằng logic thực tế
        return {
          id: `${userId}-${room.participantId}`, // ID phòng chat
          participants: [userReceiver],
          lastMessage: {
            text: room.lastMessageText,
            timestamp: room.lastMessageTimestamp,
            senderId: room.senderId,
          },
        };
      })
    );

    return chatRooms;
  }

  // Hàm giả lập lấy thông tin user (thay bằng logic thực tế của bạn)
  private async getUserInfo(userId: string): Promise<any> {
    // Thay bằng API hoặc database query thực tế
    return {
      id: userId,
      name: `User ${userId}`,
      email: `${userId}@example.com`,
      avatar: "https://example.com/avatar.jpg",
    };
  }


}