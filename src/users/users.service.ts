import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/users.entity';
import { Address } from './entities/address.entity';
import { CreateUserInput } from './dto/createUser.dto';
import { UpdateUserInput } from './dto/updateuser.dto';
import { CreateAddressInput } from './dto/create-address.input';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create({
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash: input.password, // Will be hashed by @BeforeInsert()
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`New user registered: ${savedUser.email}`);
    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: {
        userId: true,
        name: true,
        email: true,
        phoneNumber: true,
        passwordHash: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findById(userId);

    if (input.name !== undefined) user.name = input.name;
    if (input.email !== undefined) {
      // Check for email uniqueness
      const existingUser = await this.userRepository.findOne({
        where: { email: input.email },
      });
      if (existingUser && existingUser.userId !== userId) {
        throw new ConflictException('Email already in use by another user');
      }
      user.email = input.email;
    }
    if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber;
    if (input.password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(input.password, salt);
    }

    return this.userRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  // Address management
  async addAddress(
    userId: string,
    input: CreateAddressInput,
  ): Promise<Address> {
    // If setting as default, unset any existing defaults
    if (input.isDefault) {
      await this.addressRepository.update(
        { userId },
        { isDefault: false },
      );
    }

    const address = this.addressRepository.create({
      ...input,
      userId,
    });

    return this.addressRepository.save(address);
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC' },
    });
  }

  async removeAddress(userId: string, addressId: string): Promise<boolean> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepository.remove(address);
    return true;
  }
}