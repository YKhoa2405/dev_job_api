import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qr: string,

  ) {
    return this.rolesService.getAllRole(+currentPage, +limit, qr);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.getRoleDetail(id);
  }

  @Patch(':id')
  update(@Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() user: IUser) {
    return this.rolesService.updateRole(id, updateRoleDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string,
    @User() user: IUser) {
    return this.rolesService.removeRole(id, user);
  }
}
