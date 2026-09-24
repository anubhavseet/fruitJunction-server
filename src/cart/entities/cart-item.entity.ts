import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Cart } from './cart.entity';

@ObjectType({ description: 'An individual item within a shopping cart' })
@Entity('cart_items')
export class CartItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field(() => Product)
  @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @Column()
  cartId: string;

  @Field(() => Float)
  get subtotal(): number {
    return Number((Number(this.price) * this.quantity).toFixed(2));
  }
}
