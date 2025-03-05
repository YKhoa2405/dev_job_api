import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SuggestionDocument = HydratedDocument<Suggestion>;

@Schema({
    timestamps: true,
    collation: { locale: 'en', strength: 2 }, // Case-insensitive
})
export class Suggestion {
    @Prop({ required: true, index: true })
    keyword: string;

    @Prop({
        type: [String],
        required: true,
        validate: {
            validator: (arr: string[]) => arr.length <= 20,
            message: 'Số lượng gợi ý không được vượt quá 20',
        },
    })
    suggestions: string[];

    @Prop({ default: 0, index: true })
    frequency: number;

}

export const SuggestionSchema = SchemaFactory.createForClass(Suggestion);

// Thêm compound index nếu cần
SuggestionSchema.index({ keyword: 1, frequency: -1 });