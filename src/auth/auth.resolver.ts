import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../users/dto/createUser.dto';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { description: 'Register a new user account' })
  async register(
    @Args('input') input: CreateUserInput,
    @Context() context: { res: Response },
  ): Promise<AuthResponse> {
    return this.authService.register(input, context.res);
  }

  @Mutation(() => AuthResponse, { description: 'Login with email and password' })
  async login(
    @Args('input') input: LoginInput,
    @Context() context: { res: Response },
  ): Promise<AuthResponse> {
    return this.authService.login(input, context.res);
  }

  @Mutation(() => AuthResponse, { description: 'Refresh access token' })
  @UseGuards(GqlAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Context() context: { res: Response },
  ): Promise<AuthResponse> {
    return this.authService.refreshTokens(user.userId, context.res);
  }

  @Mutation(() => Boolean, { description: 'Logout and clear auth cookies' })
  async logout(@Context() context: { res: Response }): Promise<boolean> {
    return this.authService.logout(context.res);
  }
}
