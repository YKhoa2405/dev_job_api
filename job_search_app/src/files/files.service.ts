import { Injectable, BadRequestException } from '@nestjs/common';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from './files.config';

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không có file nào được tải lên.');
    }

    const allowedMimeTypes = [
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf', 
      'image/jpeg', 
      'image/png'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file doc, docx, pdf, jpg, jpeg, png.');
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const fileName = `${Date.now()}_${file.originalname}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(uploadParams));  // 🟢 Thay vì .upload() như v2
      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("Lỗi khi tải lên S3:", error);
      throw new BadRequestException('Lỗi khi tải file lên S3.');
    }
  }
}
