import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType({ description: 'Order response returned to frontend to trigger Razorpay checkout modal' })
export class PaymentOrderResponse {
  @Field(() => String)
  razorpayOrderId: string;

  @Field(() => Float, { description: 'Amount in paise' })
  amount: number;

  @Field(() => String)
  currency: string;

  @Field(() => String, { description: 'Razorpay Public Key ID' })
  keyId: string;
}
