import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product])],
  providers: [CartService, CartResolver],
  exports: [CartService],
})
export class CartModule {}
