import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DashboardStats } from './dto/dashboard-stats.type';
import { PresignedUrlResponse } from './dto/presigned-url.type';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/users.entity';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => DashboardStats, {
    name: 'dashboardStats',
    description: 'Get high-level summary metrics for admin dashboard',
  })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  @Mutation(() => PresignedUrlResponse, {
    description: 'Get an S3 presigned URL for direct image uploading',
  })
  async getPresignedUploadUrl(
    @Args('filename') filename: string,
    @Args('fileType') fileType: string,
  ): Promise<PresignedUrlResponse> {
    return this.adminService.getPresignedUploadUrl(filename, fileType);
  }
}
