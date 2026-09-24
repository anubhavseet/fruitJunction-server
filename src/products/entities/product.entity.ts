import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType({ description: 'Fruit and salad product item' })
@Entity('products')
export class Product {
  @Field(() => ID, { description: 'Unique product ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Name of the product' })
  @Column()
  name: string;

  @Field({ nullable: true, description: 'Detailed description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Float, { description: 'Regular price in currency units' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field(() => Float, { nullable: true, description: 'Discounted sale price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice?: number;

  @Field({ description: 'Category (e.g. Fresh Mixed Fruit Salad, Healthy Detox Juices)' })
  @Column()
  category: string;

  @Field({ nullable: true, description: 'Image asset path or URL' })
  @Column({ nullable: true })
  imageUrl?: string;

  @Field(() => Boolean, { defaultValue: true, description: 'Stock availability status' })
  @Column({ default: true })
  inStock: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
