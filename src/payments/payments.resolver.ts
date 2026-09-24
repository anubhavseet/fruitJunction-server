import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentOrderResponse } from './dto/payment-order.response';
import { VerifyPaymentInput } from './dto/verify-payment.input';
import { VerifyPaymentResponse } from './dto/verify-payment.response';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/users.entity';

@Resolver(() => Payment)
@UseGuards(GqlAuthGuard)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => PaymentOrderResponse, {
    description: 'Create a Razorpay payment order for an existing order',
  })
  async createPaymentOrder(
    @CurrentUser() user: User,
    @Args('orderId') orderId: string,
  ): Promise<PaymentOrderResponse> {
    return this.paymentsService.createPaymentOrder(orderId, user.userId);
  }

  @Mutation(() => VerifyPaymentResponse, {
    description: 'Verify Razorpay payment signature after client payment completion',
  })
  async verifyPayment(
    @CurrentUser() user: User,
    @Args('input') input: VerifyPaymentInput,
  ): Promise<VerifyPaymentResponse> {
    return this.paymentsService.verifyPayment(input, user.userId);
  }

  @Query(() => [Payment], {
    name: 'allPayments',
    description: 'Get all payment transactions (Admin only)',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllPayments(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }
}
