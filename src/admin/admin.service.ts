import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/users.entity';
import { Product } from '../products/entities/product.entity';
import { DashboardStats } from './dto/dashboard-stats.type';
import { PresignedUrlResponse } from './dto/presigned-url.type';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {
    this.region = this.configService.get<string>('AWS_REGION', 'ap-south-1');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'fruit-junction-assets');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (accessKeyId && secretAccessKey) {
      try {
        this.s3Client = new S3Client({
          region: this.region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      } catch (e) {
        this.logger.warn('Failed to initialize S3Client, using simulated uploads');
      }
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const totalOrders = await this.orderRepository.count();

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where("order.status != :cancelled", { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    const totalRevenue = revenueResult?.total ? parseFloat(revenueResult.total) : 0;

    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });

    const pendingOrders = await this.orderRepository.count({
      where: [
        { status: OrderStatus.PENDING },
        { status: OrderStatus.PREPARING },
        { status: OrderStatus.CONFIRMED },
      ],
    });

    const deliveredOrders = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });

    const totalProducts = await this.productRepository.count();

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      activeUsers,
      pendingOrders,
      deliveredOrders,
      totalProducts,
    };
  }

  async getPresignedUploadUrl(
    filename: string,
    fileType: string,
  ): Promise<PresignedUrlResponse> {
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `products/${Date.now()}-${cleanName}`;

    if (this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
          expiresIn: 3600,
        });

        const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

        return {
          uploadUrl,
          fileUrl,
        };
      } catch (err) {
        this.logger.error(`Error generating S3 presigned URL: ${err.message}`);
      }
    }

    // Fallback simulation mode
    const simulatedFileUrl = `/images/products/${cleanName}`;
    return {
      uploadUrl: `https://simulation.upload.fruitjunction.local/${key}`,
      fileUrl: simulatedFileUrl,
    };
  }
}
