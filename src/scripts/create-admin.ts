import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

function getCliArg(key: string, defaultValue: string): string {
  const argWithEqual = process.argv.find((a) => a.startsWith(`--${key}=`));
  if (argWithEqual) {
    return argWithEqual.split('=')[1];
  }
  const index = process.argv.indexOf(`--${key}`);
  if (index !== -1 && process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) {
    return process.argv[index + 1];
  }
  return defaultValue;
}

async function bootstrap() {
  console.log('🔄 Initializing NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userRepository: Repository<User> = app.get(getRepositoryToken(User));

    const email = getCliArg('email', process.env.ADMIN_EMAIL || 'admin@fruitjunction.com').toLowerCase().trim();
    const password = getCliArg('password', process.env.ADMIN_PASSWORD || 'Admin@123456');
    const name = getCliArg('name', process.env.ADMIN_NAME || 'Fruit Junction Admin');
    const phone = getCliArg('phone', process.env.ADMIN_PHONE || '9876543210');

    if (!email || !password) {
      console.error('❌ Error: Email and password are required.');
      process.exit(1);
    }

    console.log(`🔍 Checking if user with email "${email}" already exists...`);
    const existingUser = await userRepository.findOne({
      where: { email },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (existingUser) {
      console.log(`⚠️ User "${email}" already exists with role: ${existingUser.role}.`);
      console.log('🔄 Promoting user to ADMIN and updating password...');

      const salt = await bcrypt.genSalt(10);
      existingUser.passwordHash = await bcrypt.hash(password, salt);
      existingUser.role = UserRole.ADMIN;
      existingUser.isActive = true;
      if (name) existingUser.name = name;
      if (phone) existingUser.phoneNumber = parseInt(phone, 10);

      await userRepository.save(existingUser);
      console.log('✅ User successfully promoted to ADMIN with updated password!');
    } else {
      console.log(`✨ Creating new ADMIN account for "${email}"...`);

      const newUser = userRepository.create({
        name,
        email,
        phoneNumber: parseInt(phone, 10),
        passwordHash: password, // Hashed by @BeforeInsert() in User entity
        role: UserRole.ADMIN,
        isActive: true,
      });

      const savedUser = await userRepository.save(newUser);
      console.log(`✅ Admin created successfully with ID: ${savedUser.userId}`);
    }

    console.log('\n========================================');
    console.log('🎉 ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name:     ${name}`);
    console.log(`📱 Phone:    ${phone}`);
    console.log(`🛡️  Role:     ADMIN`);
    console.log('========================================');
    console.log('👉 You can now log in at: http://localhost:5173/login');
    console.log('👉 And access the admin panel at: http://localhost:5173/admin\n');
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
