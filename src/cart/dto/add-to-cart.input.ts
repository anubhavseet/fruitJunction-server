import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';

@InputType({ description: 'Data required to add an item to the shopping cart' })
export class AddToCartInput {
  @Field(() => Int, { description: 'ID of the product' })
  @IsInt()
  @Min(1)
  productId: number;

  @Field(() => Int, { defaultValue: 1, description: 'Quantity of the product' })
  @IsInt()
  @Min(1)
  quantity: number;
}
