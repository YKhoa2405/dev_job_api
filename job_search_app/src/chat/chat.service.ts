// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Company, CompanyDocument } from 'src/companies/schemas/company.schema';
import { Candidate, CandidateDocument } from 'src/candidates/schemas/candidate.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,

  ) { }

  async saveMessage(senderId: string, recipientId: string, message: string, fileUrl?: string): Promise<Message> {
    const newMessage = new this.messageModel({
      senderId,
      recipientId,
      message: message || "",
      fileUrl: fileUrl || null,
      timestamp: new Date(),
      isRead: false,
    });
    return newMessage.save();
  }



  async getMessages(senderId: string, recipientId: string): Promise<Message[]> {
    // Lấy tất cả tin nhắn giữa senderId và recipientId
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId },
        ],
      })
      .sort({ timestamp: 1 })
      .exec();

    // Đánh dấu tất cả tin nhắn từ senderId gửi đến recipientId là "đã đọc"
    await this.messageModel
      .updateMany(
        {
          senderId,
          recipientId,
          isRead: false,
        },
        { $set: { isRead: true } }
      )
      .exec();

    return messages;
  }

  async getChatRooms(userId: string): Promise<any[]> {
    // Lấy danh sách chat rooms với tin nhắn cuối cùng
    const rawChatRooms = await this.messageModel
      .aggregate([
        {
          $match: {
            $or: [{ senderId: userId }, { recipientId: userId }],
          },
        },
        {
          $sort: { timestamp: -1 },
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
            lastMessage: { $first: "$$ROOT" },
          },
        },
        {
          $project: {
            participantId: "$_id",
            lastMessage: {
              text: "$lastMessage.message",
              timestamp: "$lastMessage.timestamp",
              senderId: "$lastMessage.senderId",
              fileUrl: { $ifNull: ["$lastMessage.fileUrl", null] },
              isRead: "$lastMessage.isRead",
            },
          },
        },
      ])
      .exec();

    // Dùng getParticipantInfo để lấy thông tin participant
    const chatRooms = await Promise.all(
      rawChatRooms.map(async (room) => {
        const participantInfo = await this.getParticipantInfo(room.participantId);
        return {
          id: `${userId}-${room.participantId}`,
          participants: participantInfo, // Chỉ chứa id, username, avatar
          lastMessage: room.lastMessage,
        };
      })
    );

    console.log("Chat rooms:", chatRooms);
    return chatRooms;
  }

  async getParticipantInfo(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    const role = await this.roleModel.findById(user.role).exec();
    if (role.name === 'EMPLOYER_USER') {
      const company = await this.companyModel.findOne({ userId: user._id }).exec();
      return {
        id: user._id,
        name: company?.name,
        avatar: company?.avatar
      };
    } else if (role.name === 'NORMAL_USER') {
      return {
        id: user._id,
        name: user?.name,
      };

    }
  }




}