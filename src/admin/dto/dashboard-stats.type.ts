import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType({ description: 'System-wide summary metrics for Admin Dashboard' })
export class DashboardStats {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  activeUsers: number;

  @Field(() => Int)
  pendingOrders: number;

  @Field(() => Int, { defaultValue: 0 })
  deliveredOrders: number;

  @Field(() => Int, { defaultValue: 0 })
  totalProducts: number;
}
