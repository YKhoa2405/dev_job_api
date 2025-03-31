import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { copyFile } from 'fs';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) { }

  @Post()
  create(
    @Body() createCandidateDto: CreateCandidateDto,
    @User() user: IUser,) {
    return this.candidatesService.create(createCandidateDto, user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query("companyId") companyId: string,
    @Query() qr: string,
    @User() user: IUser
  ) {
    return this.candidatesService.getAllCandidates(+currentPage, +limit, qr, companyId,user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @User() user: IUser,) {
    return this.candidatesService.update(id, updateCandidateDto, user);
  }
}
