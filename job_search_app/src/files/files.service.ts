import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { s3 } from './files.config';

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File): Promise<string> { // Chỉ trả về đường dẫn
    const params: PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now().toString()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const allowedMimeTypes = [
      'application/msword',        // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf',            // .pdf
      'image/jpeg',                 // .jpg, .jpeg
      'image/png',                  // .png
    ];

    // Kiểm tra loại tệp hợp lệ
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ cho phép các định dạng file doc, docx, pdf, jpg, jpeg, png');
    }

    // Tải tệp lên S3
    const result = await s3.upload(params).promise();

    // Trả về đường dẫn của tệp đã tải lên
    return result.Location; // Chỉ trả về đường dẫn
  }
}
