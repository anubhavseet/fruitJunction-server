import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order, PaymentStatus } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/users.entity';

@ObjectType({ description: 'Payment transaction record' })
@Entity('payments')
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Field(() => String)
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Field(() => String)
  @Column({ type: 'text' })
  razorpayOrderId: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  razorpayPaymentId?: string;

  @Column({ type: 'text', nullable: true })
  razorpaySignature?: string;

  @Field(() => PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Field(() => ID)
  @Column()
  orderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
