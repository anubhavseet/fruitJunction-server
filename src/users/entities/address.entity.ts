import { Field, ObjectType, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './users.entity';

@ObjectType({ description: 'Saved delivery address' })
@Entity('addresses')
export class Address {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'text' })
  label: string; // e.g. "Home", "Work", "Mom's Place"

  @Field(() => String)
  @Column({ type: 'text' })
  addressLine1: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  addressLine2?: string;

  @Field(() => String)
  @Column({ type: 'text' })
  city: string;

  @Field(() => String)
  @Column({ type: 'text' })
  state: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 10 })
  pincode: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
