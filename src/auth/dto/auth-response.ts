import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/users.entity';

@ObjectType({ description: 'Response returned after successful authentication' })
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field(() => String)
  message: string;
}
