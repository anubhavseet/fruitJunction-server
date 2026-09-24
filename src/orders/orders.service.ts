import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
  ) {}

  async createOrderFromCart(
    userId: string,
    input: CreateOrderInput,
  ): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty. Add items before placing an order.');
    }

    const subtotal = cart.totalAmount;
    const deliveryFee = subtotal > 299 ? 0 : 40;
    const totalAmount = Number((subtotal + deliveryFee).toFixed(2));

    const order = this.orderRepository.create({
      userId,
      totalAmount,
      deliveryFee,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod,
      status:
        input.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
          ? OrderStatus.CONFIRMED
          : OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      notes: input.notes,
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = cart.items.map((cartItem) => {
      return this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: cartItem.productId,
        productName: cartItem.product?.name || 'Fresh Product',
        quantity: cartItem.quantity,
        unitPrice: Number(cartItem.price),
      });
    });

    await this.orderItemRepository.save(orderItems);

    // Clear user cart after placing order
    await this.cartService.clearCart(userId);

    this.logger.log(
      `Order #${savedOrder.id} created for user ${userId} with total ₹${totalAmount}`,
    );

    return this.findById(savedOrder.id);
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: {
        items: {
          product: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(
    orderId: string,
    userId?: string,
    isAdmin?: boolean,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (userId && !isAdmin && order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: {
        items: {
          product: true,
        },
        user: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: input.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order #${input.orderId} not found`);
    }

    if (input.status) {
      order.status = input.status;
    }
    if (input.paymentStatus) {
      order.paymentStatus = input.paymentStatus;
    }

    await this.orderRepository.save(order);
    this.logger.log(`Order #${order.id} status updated to ${order.status}`);
    return this.findById(order.id);
  }

  async updatePaymentInfo(
    orderId: string,
    details: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      paymentStatus?: PaymentStatus;
      status?: OrderStatus;
    },
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (details.razorpayOrderId) order.razorpayOrderId = details.razorpayOrderId;
    if (details.razorpayPaymentId) order.razorpayPaymentId = details.razorpayPaymentId;
    if (details.paymentStatus) order.paymentStatus = details.paymentStatus;
    if (details.status) order.status = details.status;

    await this.orderRepository.save(order);
    return this.findById(orderId);
  }
}
