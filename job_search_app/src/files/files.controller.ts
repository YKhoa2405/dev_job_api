import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Public } from 'src/common/decorator/customize';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('uploadChat')
  @Public()
  @UseInterceptors(FileInterceptor('file')) // 'file' là tên trường trong form data
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.filesService.uploadFile(file);
    return { url: fileUrl }; // Trả về đường dẫn tệp đã tải lên
  }
}
