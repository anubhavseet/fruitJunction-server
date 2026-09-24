import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ParseIntPipe, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/users.entity';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) { }

  @Query(() => [Product], {
    name: 'products',
    description: 'Retrieve all products with optional category filter',
  })
  async getProducts(
    @Args('category', { type: () => String, nullable: true }) category?: string,
  ): Promise<Product[]> {
    return this.productsService.findAll(category);
  }

  @Query(() => Product, {
    name: 'product',
    description: 'Retrieve a single product by ID',
  })
  async getProduct(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
  ): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Mutation(() => Product, { description: 'Create a new fruit or salad product (Admin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ): Promise<Product> {
    return this.productsService.create(createProductInput);
  }

  @Mutation(() => Product, { description: 'Update an existing product (Admin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    return this.productsService.update(updateProductInput.id, updateProductInput);
  }

  @Mutation(() => Boolean, { description: 'Delete a product by ID (Admin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeProduct(
    @Args('id', { type: () => ID }, ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.productsService.remove(id);
  }
}
