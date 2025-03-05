import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SkillDocument = HydratedDocument<Skill>;

export class Skill {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    category: string;

    @Prop({ default: 0 })
    popularity: number;

}

export const SkillSchema = SchemaFactory.createForClass(Skill);

// Thêm chỉ mục để tối ưu hóa tìm kiếm và sắp xếp
SkillSchema.index({ name: 1 });
SkillSchema.index({ popularity: -1 });
SkillSchema.index({ category: 1 });