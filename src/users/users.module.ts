import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Address } from './entities/address.entity';
import { UserService } from './users.service';
import { UserResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address])],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UsersModule {}