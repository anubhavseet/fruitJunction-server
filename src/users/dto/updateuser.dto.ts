import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@InputType({ description: 'Data for updating an existing user profile' })
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  phoneNumber?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}