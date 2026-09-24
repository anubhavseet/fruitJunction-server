import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product.input';
import { IsInt, Min } from 'class-validator';

@InputType({ description: 'Data for updating an existing product' })
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field(() => ID, { description: 'ID of the product to update' })
  @IsInt()
  @Min(1)
  id: number;
}
