import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Address } from './address.entity';

export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
}

registerEnumType(UserRole, {
    name: 'UserRole',
    description: 'User role in the system',
});

@ObjectType({ description: 'User account entity' })
@Entity('users')
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Field(() => String)
    @Column({ type: 'text', nullable: false })
    name: string;

    @Field(() => String)
    @Column({ type: 'text', unique: true, nullable: false })
    email: string;

    @Field(() => Number)
    @Column({ type: 'bigint', nullable: false })
    phoneNumber: number;

    // Password hash — never exposed via GraphQL
    @Column({ type: 'text', nullable: false, select: false })
    passwordHash: string;

    @Field(() => UserRole)
    @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
    role: UserRole;

    @Field(() => Boolean)
    @Column({ default: true })
    isActive: boolean;

    @Field(() => [Address], { nullable: true })
    @OneToMany(() => Address, (address) => address.user, {
        cascade: true,
        eager: true,
    })
    addresses?: Address[];

    @Field(() => Date)
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        if (this.passwordHash) {
            const salt = await bcrypt.genSalt(10);
            this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }
}

// Import here to avoid circular dependency — Address is defined below
