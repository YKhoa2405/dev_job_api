import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Render } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Public } from 'src/common/decorator/customize';
import { v4 as uuidv4 } from 'uuid';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';

@Controller('payments')
@Public()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) { }

  @Post('create')
  createPaymentUrl(
    @Body('amount') amount: number,
    @Body('name') name: string): string {
    const orderId = uuidv4();
    return this.paymentsService.createPaymentUrl(orderId, amount, name);
  }

  @Get('return')
  async paymentReturn(@Query() query: any, @Res() res: Response) {
    const isValid = await this.paymentsService.verifyPayment(query);

    // Truyền dữ liệu vào view
    if (isValid) {
      return res.render('bill', {
        message: 'Thanh cong',
        transactionDetails: query // Truyền thông tin thanh toán vào view
      });
    } else {
      return res.render('bill', {
        message: 'That bai',
        transactionDetails: query // Truyền thông tin thanh toán vào view
      });
    }
  }


  @Post('save')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    return await this.paymentsService.createPayment(createPaymentDto);
  }

  @Get(':companyId')
  async getServicesByCompany(@Param('companyId') companyId: string) {
    return this.paymentsService.getPaymentByCompany(companyId);
  }

}

