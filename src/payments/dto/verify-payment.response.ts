import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Response returned after payment verification' })
export class VerifyPaymentResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  orderId: string;

  @Field(() => String, { nullable: true })
  paymentId?: string;
}
