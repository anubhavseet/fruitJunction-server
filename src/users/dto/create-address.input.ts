import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType({ description: 'Data for adding a new delivery address' })
export class CreateAddressInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  label: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  state: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
