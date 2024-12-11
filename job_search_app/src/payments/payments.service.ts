import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import qs from 'qs';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private vnpUrl: string;
  private secretKey: string;
  private tmnCode: string;
  private returnUrl: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>
  ) {
    this.vnpUrl = this.configService.get<string>('VNPAY_URL');
    this.secretKey = this.configService.get<string>('VNPAY_SECRET_KEY');
    this.tmnCode = this.configService.get<string>('VNPAY_TMN_CODE');
    this.returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');
  }

  createPaymentUrl(orderId: string, amount: number, bankCode?: string): string {
    const ipAddr = '127.0.0.1';
    const currCode = 'VND';
    const date = new Date();
    const createDate = date.toISOString().replace(/[-:TZ]/g, '').slice(0, 14);

    const vnpParams: { [key: string]: string | number } = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: amount * 100,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan dich vu: ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnpParams['vnp_BankCode'] = bankCode;
    }
    var redirectUrl = new URL(this.vnpUrl);
    Object.entries(vnpParams)
      .sort(function (_a, _b) {
        var key1 = _a[0];
        var key2 = _b[0];
        return key1.localeCompare(key2);
      })
      .forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (!value || value === "" || value === undefined || value === null) {
          return;
        }
        redirectUrl.searchParams.append(key, value.toString());
      });
    var hmac = crypto.createHmac("sha512", this.secretKey);
    var signed = hmac
      .update(Buffer.from(redirectUrl.searchParams.toString(), 'utf-8'))
      .digest("hex");
    redirectUrl.searchParams.append("vnp_SecureHash", signed);
    return redirectUrl.href;

  }

  async verifyPayment(params: any): Promise<boolean> {
    const vnp_TransactionStatus = params.vnp_TransactionStatus;
    if (vnp_TransactionStatus === '00') {
      return true;
    }
    return false;
  }


  async createPayment(createPaymentDto: CreatePaymentDto) {
    const isTransactionSuccessful = createPaymentDto.vnp_TransactionStatus === '00';

    const transaction = this.paymentModel.create({
      ...createPaymentDto,
      vnp_TransactionStatus: isTransactionSuccessful ? 'Success' : 'Failure',

    });
    return transaction;
  }

}


