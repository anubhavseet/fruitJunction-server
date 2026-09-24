import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { CartItem } from './cart-item.entity';

@ObjectType({ description: 'Customer shopping cart' })
@Entity('carts')
export class Cart {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  userId: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field(() => Float, { description: 'Total price of all items in cart' })
  get totalAmount(): number {
    if (!this.items || this.items.length === 0) return 0;
    const sum = this.items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      return acc + price * item.quantity;
    }, 0);
    return Number(sum.toFixed(2));
  }

  @Field(() => Int, { description: 'Total count of units in cart' })
  get totalItems(): number {
    if (!this.items || this.items.length === 0) return 0;
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }
}
