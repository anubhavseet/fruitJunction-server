import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/users.entity';

@Resolver(() => Order)
@UseGuards(GqlAuthGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order, { description: 'Create and place a new order from current cart' })
  async createOrder(
    @CurrentUser() user: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<Order> {
    return this.ordersService.createOrderFromCart(user.userId, input);
  }

  @Query(() => [Order], { name: 'myOrders', description: 'Get orders of the authenticated user' })
  async getMyOrders(@CurrentUser() user: User): Promise<Order[]> {
    return this.ordersService.findUserOrders(user.userId);
  }

  @Query(() => Order, { name: 'order', description: 'Get order details by ID' })
  async getOrder(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Order> {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.ordersService.findById(id, user.userId, isAdmin);
  }

  @Query(() => [Order], { name: 'allOrders', description: 'Get all system orders (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Mutation(() => Order, { description: 'Update status of an order (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(input);
  }
}
