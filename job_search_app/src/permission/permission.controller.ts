import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto, @User() user: IUser) {
    return this.permissionService.createPermission(createPermissionDto, user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
  ) {
    return this.permissionService.getAllPermisstion(+currentPage, +limit, qr);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.getPermissionsDetail(id);
  }

  @Patch(':id')
  update(@Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @User() user: IUser) {
    return this.permissionService.updatePermission(id, updatePermissionDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionService.removePermission(id, user);
  }
}
