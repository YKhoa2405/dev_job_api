import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Suggestion, SuggestionSchema } from './schemas/suggestion.schema';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Suggestion.name, schema: SuggestionSchema }]),
    CacheModule.register({
      isGlobal: true, // Cho phép sử dụng cache toàn cục
      ttl: 60000, // Thời gian cache mặc định (milliseconds)
    })],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService]
})
export class SuggestionsModule { }
