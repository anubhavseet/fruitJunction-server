import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/users.entity';
import { Product } from '../products/entities/product.entity';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product])],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {}
