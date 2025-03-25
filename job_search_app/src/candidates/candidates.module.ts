import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Candidate.name, schema: CandidateSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),

  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService]
})
export class CandidatesModule { }
