import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }])
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule { }
