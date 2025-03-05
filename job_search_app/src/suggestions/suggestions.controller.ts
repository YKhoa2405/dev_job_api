import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { Public } from 'src/common/decorator/customize';



@Controller('suggestions')
@Public()
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) { }

  @Get()
  async getSuggestions(
    @Query("query") query: string,
  ) {
    return this.suggestionsService.getSuggestions(query);
  }

  @Get('popular')
  async getPopularKeywords(
  ): Promise<string[]> {
    return this.suggestionsService.getPopularKeywords(10);
  }
}
