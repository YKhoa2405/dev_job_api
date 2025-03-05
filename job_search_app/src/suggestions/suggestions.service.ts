import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Suggestion, SuggestionDocument } from './schemas/suggestion.schema';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(
    @InjectModel(Suggestion.name)
    private suggestionModel: Model<SuggestionDocument>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) { }

  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    // Early return for invalid queries
    if (!query || query.trim() === '') {
      return [];
    }

    // Use caching to improve performance
    const cacheKey = `suggestions:${query.trim().toLowerCase()}`;
    const cachedSuggestions = await this.cacheManager.get<string[]>(cacheKey);
    if (cachedSuggestions) {
      return cachedSuggestions;
    }

    const lowerQuery = query.trim().toLowerCase();

    try {
      // More efficient query with text search
      const results = await this.suggestionModel.aggregate([
        {
          $match: {
            $or: [
              { keyword: { $regex: lowerQuery, $options: 'i' } },
              { suggestions: { $regex: lowerQuery, $options: 'i' } }
            ]
          }
        },
        { $unwind: '$suggestions' },
        {
          $match: {
            'suggestions': { $regex: lowerQuery, $options: 'i' }
          }
        },
        {
          $addFields: {
            relevanceScore: {
              $add: [
                '$frequency',
                { $cond: [{ $eq: [{ $indexOfCP: [{ $toLower: '$suggestions' }, lowerQuery] }, 0] }, 100, 0] },
                -{ $indexOfCP: [{ $toLower: '$suggestions' }, lowerQuery] }
              ]
            }
          }
        },
        { $sort: { relevanceScore: -1 } },
        { $limit: limit },
        { $group: { _id: null, suggestions: { $push: '$suggestions' } } }
      ]);

      const suggestions = results[0]?.suggestions || [];

      // Cache the results
      await this.cacheManager.set(cacheKey, suggestions, 60000); // Cache for 1 minute

      // Check for exact match and update frequency
      await this.updateFrequency(lowerQuery);

      return suggestions;
    } catch (error) {
      this.logger.error(`Error in getSuggestions: ${error.message}`, error.stack);
      return [];
    }
  }

  async updateFrequency(keyword: string): Promise<void> {
    try {
      await this.suggestionModel.updateOne(
        { keyword: keyword.toLowerCase() },
        {
          $inc: { frequency: 1 },
          $set: { updatedAt: new Date() }
        },
        { upsert: false }
      ).exec();
    } catch (error) {
      this.logger.error(`Error updating frequency for keyword: ${keyword}`, error.stack);
    }
  }

  async getPopularKeywords(limit: number = 10): Promise<string[]> {
    try {
      const cacheKey = `popular-keywords:${limit}`;

      // Check cache first
      const cachedPopularKeywords = await this.cacheManager.get<string[]>(cacheKey);
      if (cachedPopularKeywords) {
        return cachedPopularKeywords;
      }

      const results = await this.suggestionModel
        .find()
        .sort({ frequency: -1 })
        .limit(limit)
        .lean()
        .exec();

      const popularKeywords = results.map((doc) => doc.keyword);

      // Cache popular keywords
      await this.cacheManager.set(cacheKey, popularKeywords, 300000); // Cache for 5 minutes

      return popularKeywords;
    } catch (error) {
      this.logger.error(`Error in getPopularKeywords: ${error.message}`, error.stack);
      return [];
    }
  }
}