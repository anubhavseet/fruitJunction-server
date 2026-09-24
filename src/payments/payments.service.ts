import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { Payment } from './entities/payment.entity';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus, OrderStatus } from '../orders/entities/order.entity';
import { PaymentOrderResponse } from './dto/payment-order.response';
import { VerifyPaymentInput } from './dto/verify-payment.input';
import { VerifyPaymentResponse } from './dto/verify-payment.response';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: Razorpay | null = null;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_placeholder');
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', 'placeholder_secret');

    try {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    } catch (e) {
      this.logger.warn('Failed to initialize Razorpay SDK instance, will use simulation mode');
    }
  }

  async createPaymentOrder(
    orderId: string,
    userId: string,
  ): Promise<PaymentOrderResponse> {
    const order = await this.ordersService.findById(orderId, userId);

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    const amountInPaise = Math.round(Number(order.totalAmount) * 100);
    let razorpayOrderId = `order_sim_${Date.now()}`;

    if (this.razorpay && this.keyId !== 'rzp_test_placeholder') {
      try {
        const rzpOrder = await this.razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.id.slice(0, 40),
          notes: {
            orderId: order.id,
            userId,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        this.logger.error(`Razorpay API error: ${err.message}. Using simulated order.`);
        razorpayOrderId = `order_mock_${Date.now()}`;
      }
    }

    const payment = this.paymentRepository.create({
      orderId: order.id,
      userId,
      amount: order.totalAmount,
      currency: 'INR',
      razorpayOrderId,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepository.save(payment);

    await this.ordersService.updatePaymentInfo(order.id, {
      razorpayOrderId,
    });

    this.logger.log(`Created payment order ${razorpayOrderId} for order #${order.id}`);

    return {
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: this.keyId,
    };
  }

  async verifyPayment(
    input: VerifyPaymentInput,
    userId: string,
  ): Promise<VerifyPaymentResponse> {
    const order = await this.ordersService.findById(input.orderId, userId);
    if (!order) {
      throw new NotFoundException(`Order #${input.orderId} not found`);
    }

    let isValid = false;

    // If it's a simulated order or matches secret hash
    if (
      input.razorpayOrderId.startsWith('order_sim_') ||
      input.razorpayOrderId.startsWith('order_mock_')
    ) {
      isValid = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === input.razorpaySignature;
    }

    let payment = await this.paymentRepository.findOne({
      where: { razorpayOrderId: input.razorpayOrderId },
    });

    if (!payment) {
      payment = this.paymentRepository.create({
        orderId: order.id,
        userId,
        amount: order.totalAmount,
        currency: 'INR',
        razorpayOrderId: input.razorpayOrderId,
      });
    }

    if (!isValid) {
      payment.status = PaymentStatus.FAILED;
      payment.razorpayPaymentId = input.razorpayPaymentId;
      await this.paymentRepository.save(payment);
      throw new BadRequestException('Invalid payment signature');
    }

    payment.status = PaymentStatus.PAID;
    payment.razorpayPaymentId = input.razorpayPaymentId;
    payment.razorpaySignature = input.razorpaySignature;
    await this.paymentRepository.save(payment);

    await this.ordersService.updatePaymentInfo(order.id, {
      razorpayPaymentId: input.razorpayPaymentId,
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.CONFIRMED,
    });

    this.logger.log(`Payment verified for order #${order.id} (Payment: ${input.razorpayPaymentId})`);

    return {
      success: true,
      orderId: order.id,
      paymentId: input.razorpayPaymentId,
    };
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: {
        order: true,
        user: true,
      },
      order: { createdAt: 'DESC' },
    });
  }
}
