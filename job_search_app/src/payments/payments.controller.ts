import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from 'src/common/decorator/customize';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@Public()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }
  @Get('create')
  createPaymentUrl(
    @Query('amount') amount: number): string {
    const orderId = uuidv4();
    return this.paymentsService.createPaymentUrl(orderId, amount);
  }

  @Get('return')
  async paymentReturn(@Query() query: any): Promise<any> {
    const isValid = await this.paymentsService.verifyPayment(query);
    if (isValid) {
      return {
        message: 'Payment success',
        transactionDetails: query,
      };
    } else {
      return {
        message: 'Payment verification failed',
        transactionDetails: query,
      };
    }
  }

  @Post('save')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    return  await this.paymentsService.createPayment(createPaymentDto);


  }


}

