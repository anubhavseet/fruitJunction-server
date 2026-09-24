import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Data returned by Razorpay checkout modal upon successful customer payment' })
export class VerifyPaymentInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}
