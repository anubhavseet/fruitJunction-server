import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@ObjectType({ description: 'An item belonging to an order' })
@Entity('order_items')
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'text' })
  productName: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Field(() => Float)
  get subtotal(): number {
    return Number((Number(this.unitPrice) * this.quantity).toFixed(2));
  }

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({ nullable: true })
  productId?: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;
}
