import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/users.service';
import { CreateUserInput } from '../users/dto/createUser.dto';
import { LoginInput } from './dto/login.input';
import { User } from '../users/entities/users.entity';
import { Response } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: CreateUserInput, res: Response): Promise<{ user: User; message: string }> {
    const user = await this.userService.createUser(input);
    this.setTokenCookies(res, user);
    this.logger.log(`User registered: ${user.email}`);
    return { user, message: 'Registration successful' };
  }

  async login(input: LoginInput, res: Response): Promise<{ user: User; message: string }> {
    const user = await this.userService.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.userService.validatePassword(
      user,
      input.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.setTokenCookies(res, user);
    this.logger.log(`User logged in: ${user.email}`);
    return { user, message: 'Login successful' };
  }

  async refreshTokens(userId: string, res: Response): Promise<{ user: User; message: string }> {
    const user = await this.userService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    this.setTokenCookies(res, user);
    return { user, message: 'Token refreshed' };
  }

  logout(res: Response): boolean {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return true;
  }

  private setTokenCookies(res: Response, user: User): void {
    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
