import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

@InputType({ description: 'Data required to register a new user' })
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => Number)
  @IsNumber()
  phoneNumber: number;

  @Field(() => String)
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}