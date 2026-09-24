import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

@InputType({ description: 'Data required to create a new product' })
export class CreateProductInput {
  @Field({ description: 'Product title or name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true, description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { description: 'Regular price' })
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Float, { nullable: true, description: 'Discounted sale price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @Field({ description: 'Category name' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @Field({ nullable: true, description: 'Image asset path or URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true, description: 'In-stock status' })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
}
