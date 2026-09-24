import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

@InputType({ description: 'Data required to update quantity of an item in the cart' })
export class UpdateCartItemInput {
  @Field(() => ID, { description: 'ID of the cart item' })
  @IsUUID()
  @IsNotEmpty()
  cartItemId: string;

  @Field(() => Int, { description: 'New quantity (set to 0 to remove item)' })
  @IsInt()
  @Min(0)
  quantity: number;
}
