import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Public } from 'src/common/decorator/customize';

@Controller('skills')
@Public()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.createSkill(createSkillDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.skillsService.getAllSkill();
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.updateSkill(id, updateSkillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillsService.removeSkill(id);
  }
}
