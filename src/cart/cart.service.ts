import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!cart) {
      const newCart = this.cartRepository.create({
        userId,
        items: [],
      });
      cart = await this.cartRepository.save(newCart);
      const reloaded = await this.cartRepository.findOne({
        where: { id: cart.id },
        relations: {
          items: {
            product: true,
          },
        },
      });
      if (reloaded) {
        cart = reloaded;
      }
    }

    return cart;
  }

  async getCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  async addToCart(userId: string, input: AddToCartInput): Promise<Cart> {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product #${input.productId} not found`);
    }

    if (!product.inStock) {
      throw new BadRequestException(`Product "${product.name}" is currently out of stock`);
    }

    const cart = await this.getOrCreateCart(userId);
    const effectivePrice = product.salePrice ?? product.price;

    let existingItem = cart.items.find(
      (item) => Number(item.productId) === Number(input.productId),
    );

    if (existingItem) {
      existingItem.quantity += input.quantity;
      existingItem.price = Number(effectivePrice);
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: product.id,
        quantity: input.quantity,
        price: Number(effectivePrice),
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    input: UpdateCartItemInput,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === input.cartItemId);

    if (!item) {
      throw new NotFoundException('Item not found in your cart');
    }

    if (input.quantity <= 0) {
      await this.cartItemRepository.remove(item);
    } else {
      item.quantity = input.quantity;
      await this.cartItemRepository.save(item);
    }

    return this.getCart(userId);
  }

  async removeCartItem(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.id === cartItemId);

    if (!item) {
      throw new NotFoundException('Item not found in your cart');
    }

    await this.cartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId);

    if (cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }

    return this.getCart(userId);
  }
}
