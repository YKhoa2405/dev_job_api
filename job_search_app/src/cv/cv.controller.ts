import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FilesService } from 'src/files/files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly filesService: FilesService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('url'))
  async create(
    @Body() createCvDto: CreateCvDto,
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser

  ) {
    const cvUrl = await this.filesService.uploadFile(file)
    return this.cvService.createCv(createCvDto, user, cvUrl);
  }

  @Get()
  findAll() {
    return this.cvService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.getCvByCurrentUser(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.updateCv(id, updateCvDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvService.removeCv(id);
  }
}
