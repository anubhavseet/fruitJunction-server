import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Current order fulfillment status',
});

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status of the order',
});

export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Payment method chosen for order',
});

@ObjectType({ description: 'Customer order entity' })
@Entity('orders')
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Field(() => String)
  @Column({ type: 'text' })
  deliveryAddress: string;

  @Field(() => PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Field(() => PaymentMethod)
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.RAZORPAY,
  })
  paymentMethod: PaymentMethod;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  paymentId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  razorpayOrderId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  razorpayPaymentId?: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
