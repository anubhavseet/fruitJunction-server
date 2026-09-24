import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './entities/users.entity';
import { Address } from './entities/address.entity';
import { UpdateUserInput } from './dto/updateuser.dto';
import { CreateAddressInput } from './dto/create-address.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/users.entity';

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => User, { name: 'me', description: 'Get the currently authenticated user' })
    @UseGuards(GqlAuthGuard)
    async getMe(@CurrentUser() user: User): Promise<User> {
        return this.userService.findById(user.userId);
    }

    @Query(() => [User], { name: 'users', description: 'Get all users (admin only)' })
    @UseGuards(GqlAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async getUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Mutation(() => User, { description: 'Update current user profile' })
    @UseGuards(GqlAuthGuard)
    async updateUser(
        @CurrentUser() user: User,
        @Args('input') input: UpdateUserInput,
    ): Promise<User> {
        return this.userService.updateUser(user.userId, input);
    }

    // Address management
    @Mutation(() => Address, { description: 'Add a new delivery address' })
    @UseGuards(GqlAuthGuard)
    async addAddress(
        @CurrentUser() user: User,
        @Args('input') input: CreateAddressInput,
    ): Promise<Address> {
        return this.userService.addAddress(user.userId, input);
    }

    @Query(() => [Address], { name: 'myAddresses', description: 'Get all saved addresses' })
    @UseGuards(GqlAuthGuard)
    async getMyAddresses(@CurrentUser() user: User): Promise<Address[]> {
        return this.userService.getUserAddresses(user.userId);
    }

    @Mutation(() => Boolean, { description: 'Remove a saved address' })
    @UseGuards(GqlAuthGuard)
    async removeAddress(
        @CurrentUser() user: User,
        @Args('addressId') addressId: string,
    ): Promise<boolean> {
        return this.userService.removeAddress(user.userId, addressId);
    }
}