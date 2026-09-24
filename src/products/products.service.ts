import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async onModuleInit() {
    await this.seedInitialData();
  }

  async create(createProductInput: CreateProductInput): Promise<Product> {
    const product = this.productRepository.create(createProductInput);
    return await this.productRepository.save(product);
  }

  async findAll(category?: string): Promise<Product[]> {
    if (category) {
      return await this.productRepository.find({
        where: { category },
        order: { id: 'ASC' },
      });
    }
    return await this.productRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductInput: UpdateProductInput): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductInput);
    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<boolean> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return true;
  }

  private async seedInitialData() {
    const count = await this.productRepository.count();
    if (count < 10) {
      this.logger.log('Seeding initial Fruit Junction products...');
      const initialProducts: Partial<Product>[] = [
        {
          name: 'Cream Chia Paneer Salad',
          description: 'Nutritious fresh paneer tossed with nutrient-rich chia seeds, bell peppers and mild dressings.',
          price: 249,
          salePrice: 199,
          category: 'Paneer Based Protein Salad',
          imageUrl: '/images/products/paneer_salad.png',
          inStock: true,
        },
        {
          name: 'High Protein Rajma Salad (250 Gms)',
          description: 'Wholesome red kidney beans mixed with sweet corn, onions, capsicum and zesty lemon herb dressing.',
          price: 349,
          salePrice: 289,
          category: 'Paneer Based Protein Salad',
          imageUrl: '/images/products/paneer_salad.png',
          inStock: true,
        },
        {
          name: 'Lettuce Paprika Paneer Salad',
          description: 'Crunchy iceberg lettuce topped with marinated paprika grilled cottage cheese cubes and olives.',
          price: 499,
          salePrice: 349,
          category: 'Paneer Based Protein Salad',
          imageUrl: '/images/products/paneer_salad.png',
          inStock: true,
        },
        {
          name: 'Paneer Protein Salad Classic',
          description: 'Fresh malai paneer with diced tomatoes, English cucumbers and a pinch of roasted cumin.',
          price: 239,
          salePrice: 189,
          category: 'Paneer Based Protein Salad',
          imageUrl: '/images/products/paneer_salad.png',
          inStock: true,
        },
        {
          name: 'Creamy Fruit Bowl Deluxe',
          description: 'A vibrant medley of seasonal fresh fruits with light honey-yogurt and pomegranate seeds.',
          price: 299,
          salePrice: 249,
          category: 'Fresh Mixed Fruit Salad',
          imageUrl: '/images/products/creamy_fruit_bowl.png',
          inStock: true,
        },
        {
          name: 'Exotic Fruit Mix Bowl',
          description: 'Hand-picked kiwi, dragon fruit, blueberries, red grapes, and crisp Washington apples.',
          price: 279,
          salePrice: 219,
          category: 'Fresh Mixed Fruit Salad',
          imageUrl: '/images/products/fruit_salad_classic.png',
          inStock: true,
        },
        {
          name: 'Tropical Mango Fruit Bowl',
          description: 'Freshly diced Alphonso mangoes, pineapple slices, ripe papaya and roasted chia sprinkles.',
          price: 259,
          salePrice: 209,
          category: 'Fresh Mixed Fruit Salad',
          imageUrl: '/images/products/tropical_fruit_bowl.png',
          inStock: true,
        },
        {
          name: 'Seasonal Citrus Bowl',
          description: 'Refreshing sweet lime segments, Nagpur oranges, mint leaves, and a dash of black salt.',
          price: 219,
          salePrice: 179,
          category: 'Fresh Mixed Fruit Salad',
          imageUrl: '/images/products/seasonal_fruit_mix.png',
          inStock: true,
        },
        {
          name: 'Loki Mint Detox Juice – 300 ML',
          description: 'Cold-pressed bottle gourd infused with garden fresh mint, ginger, and lemon for natural cleansing.',
          price: 129,
          salePrice: 99,
          category: 'Healthy Detox Juices',
          imageUrl: '/images/products/green_detox_juice.png',
          inStock: true,
        },
        {
          name: 'Amla Anar Detox Juice – 300 ML',
          description: 'Immunity-boosting Indian gooseberry paired with antioxidant-rich pomegranate juice.',
          price: 149,
          salePrice: 129,
          category: 'Healthy Detox Juices',
          imageUrl: '/images/products/green_detox_juice.png',
          inStock: true,
        },
        {
          name: 'Lemon Mint Green Cooler – 300 ML',
          description: 'Zesty organic lemon juice cold-blended with peppermint, cucumber, and pink Himalayan salt.',
          price: 109,
          salePrice: 89,
          category: 'Healthy Detox Juices',
          imageUrl: '/images/products/orange_juice.png',
          inStock: true,
        },
        {
          name: 'Carrot Beet Ginger Detox – 300 ML',
          description: 'Root vegetable booster with fresh carrots, ruby red beets, and a spicy kick of ginger.',
          price: 139,
          salePrice: 119,
          category: 'Healthy Detox Juices',
          imageUrl: '/images/products/pomegranate_juice.png',
          inStock: true,
        },
        {
          name: 'Pure Cold Pressed Orange Juice',
          description: '100% natural, freshly squeezed Nagpur oranges with pulp. No added sugar or preservatives.',
          price: 149,
          salePrice: 129,
          category: 'Fresh Fruit Juices',
          imageUrl: '/images/products/orange_juice.png',
          inStock: true,
        },
        {
          name: 'Watermelon Fresh Juice – 300 ML',
          description: 'Hydrating, naturally sweet Indian watermelons cold pressed fresh on order.',
          price: 119,
          salePrice: 99,
          category: 'Fresh Fruit Juices',
          imageUrl: '/images/products/watermelon_juice.png',
          inStock: true,
        },
        {
          name: 'Fresh Pomegranate Juice – 300 ML',
          description: 'Ruby red arils pressed pure for heart health and glowing vitality. Zero water added.',
          price: 179,
          salePrice: 149,
          category: 'Fresh Fruit Juices',
          imageUrl: '/images/products/pomegranate_juice.png',
          inStock: true,
        },
        {
          name: 'Wild Berry Blast Smoothie',
          description: 'Strawberries, blueberries, cranberries blended with rich Greek yogurt and wildflower honey.',
          price: 189,
          salePrice: 159,
          category: 'Fresh Fruit Smoothies',
          imageUrl: '/images/products/berry_smoothie.png',
          inStock: true,
        },
        {
          name: 'Alphonso Mango Smoothie',
          description: 'Velvety mango puree with chilled almond milk, chia seeds, and cardamom essence.',
          price: 179,
          salePrice: 149,
          category: 'Fresh Fruit Smoothies',
          imageUrl: '/images/products/mango_smoothie.png',
          inStock: true,
        },
        {
          name: 'Green Energy Avocado Smoothie',
          description: 'Hass avocado, baby spinach, green apple, and tender coconut water for sustained vitality.',
          price: 199,
          salePrice: 179,
          category: 'Fresh Fruit Smoothies',
          imageUrl: '/images/products/green_detox_juice.png',
          inStock: true,
        },
      ];

      for (const item of initialProducts) {
        const exists = await this.productRepository.findOne({ where: { name: item.name } });
        if (!exists) {
          await this.productRepository.save(this.productRepository.create(item));
        }
      }
      this.logger.log(`Ensured starter products are seeded in database.`);
    }
  }


}
