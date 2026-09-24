import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/users.entity';

@Resolver(() => Cart)
@UseGuards(GqlAuthGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { name: 'cart', description: 'Get the current user shopping cart' })
  async getCart(@CurrentUser() user: User): Promise<Cart> {
    return this.cartService.getCart(user.userId);
  }

  @Mutation(() => Cart, { description: 'Add a product to the shopping cart' })
  async addToCart(
    @CurrentUser() user: User,
    @Args('input') input: AddToCartInput,
  ): Promise<Cart> {
    return this.cartService.addToCart(user.userId, input);
  }

  @Mutation(() => Cart, { description: 'Update item quantity in cart' })
  async updateCartItem(
    @CurrentUser() user: User,
    @Args('input') input: UpdateCartItemInput,
  ): Promise<Cart> {
    return this.cartService.updateCartItem(user.userId, input);
  }

  @Mutation(() => Cart, { description: 'Remove an item from cart' })
  async removeCartItem(
    @CurrentUser() user: User,
    @Args('cartItemId', { type: () => ID }) cartItemId: string,
  ): Promise<Cart> {
    return this.cartService.removeCartItem(user.userId, cartItemId);
  }

  @Mutation(() => Cart, { description: 'Clear all items from cart' })
  async clearCart(@CurrentUser() user: User): Promise<Cart> {
    return this.cartService.clearCart(user.userId);
  }
}
