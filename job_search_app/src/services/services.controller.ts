import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public, User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto, @User() user:IUser) {
    console.log(user)
    return this.servicesService.createService(createServiceDto, user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qr: string,
  ) {
    return this.servicesService.getAllService(+currentPage, +limit, qr);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.getServiceDetail(id);
  }

  @Patch(':id')
  update(@Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @User() user: IUser) {
    return this.servicesService.updateService(id, updateServiceDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.removeService(id);
  }
}
