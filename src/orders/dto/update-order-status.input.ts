import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

@InputType({ description: 'Data required for admin to update order or payment status' })
export class UpdateOrderStatusInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @Field(() => OrderStatus, { nullable: true })
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => PaymentStatus, { nullable: true })
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
