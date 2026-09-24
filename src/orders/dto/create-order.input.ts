import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '../entities/order.entity';

@InputType({ description: 'Data required to place an order from the active cart' })
export class CreateOrderInput {
  @Field(() => String, { description: 'Complete delivery address text' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @Field(() => PaymentMethod, {
    defaultValue: PaymentMethod.RAZORPAY,
    description: 'Chosen payment method',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => String, { nullable: true, description: 'Optional delivery instructions or notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
