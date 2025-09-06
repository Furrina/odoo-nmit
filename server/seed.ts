import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics' },
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: { name: 'Clothing' },
    }),
    prisma.category.upsert({
      where: { name: 'Furniture' },
      update: {},
      create: { name: 'Furniture' },
    }),
    prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: { name: 'Books' },
    }),
    prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: { name: 'Home & Garden' },
    }),
    prisma.category.upsert({
      where: { name: 'Sports & Outdoors' },
      update: {},
      create: { name: 'Sports & Outdoors' },
    }),
    prisma.category.upsert({
      where: { name: 'Toys & Games' },
      update: {},
      create: { name: 'Toys & Games' },
    }),
    prisma.category.upsert({
      where: { name: 'Automotive' },
      update: {},
      create: { name: 'Automotive' },
    }),
  ]);

  console.log('✅ Categories created:', categories.length);

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ecofinds.com' },
    update: {},
    create: {
      email: 'demo@ecofinds.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      username: 'demouser',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create sample products
  const sampleProducts = [
    {
      title: 'iPhone 13 Pro - Excellent Condition',
      description: 'iPhone 13 Pro in space gray, 128GB storage. Used for 6 months, always kept in case. No scratches, battery health 98%. Comes with original box and charger.',
      categoryId: categories[0].id, // Electronics
      priceCents: 89900, // $899
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10b588e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'excellent',
      location: 'New York, NY',
      ownerId: demoUser.id,
    },
    {
      title: 'Vintage Leather Jacket',
      description: 'Classic brown leather jacket, size M. Genuine leather, well-maintained. Perfect for fall and winter seasons.',
      categoryId: categories[1].id, // Clothing
      priceCents: 12500, // $125
      imageUrl: 'https://images.unsplash.com/photo-1551028719-001c67d0b3c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'good',
      location: 'Los Angeles, CA',
      ownerId: demoUser.id,
    },
    {
      title: 'Mid-Century Modern Coffee Table',
      description: 'Beautiful walnut coffee table from the 1960s. Solid wood construction, some minor wear consistent with age. Perfect for modern living rooms.',
      categoryId: categories[2].id, // Furniture
      priceCents: 45000, // $450
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'fair',
      location: 'Chicago, IL',
      ownerId: demoUser.id,
    },
    {
      title: 'The Great Gatsby - First Edition',
      description: 'Rare first edition of The Great Gatsby by F. Scott Fitzgerald. Published in 1925, some wear to dust jacket but book is in excellent condition.',
      categoryId: categories[3].id, // Books
      priceCents: 250000, // $2500
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'excellent',
      location: 'Boston, MA',
      ownerId: demoUser.id,
    },
    {
      title: 'Indoor Plant Collection',
      description: 'Collection of 5 healthy houseplants: Monstera, Fiddle Leaf Fig, Snake Plant, Pothos, and ZZ Plant. All in ceramic pots.',
      categoryId: categories[4].id, // Home & Garden
      priceCents: 8500, // $85
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'excellent',
      location: 'Seattle, WA',
      ownerId: demoUser.id,
    },
    {
      title: 'Mountain Bike - Trek 29er',
      description: 'Trek mountain bike, 29-inch wheels, 21-speed. Great for trails and commuting. Recently tuned up, new brake pads.',
      categoryId: categories[5].id, // Sports & Outdoors
      priceCents: 35000, // $350
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'good',
      location: 'Denver, CO',
      ownerId: demoUser.id,
    },
    {
      title: 'Vintage Board Game Collection',
      description: 'Collection of classic board games: Monopoly (1970s), Scrabble, Risk, and Clue. All complete with original pieces.',
      categoryId: categories[6].id, // Toys & Games
      priceCents: 7500, // $75
      imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'good',
      location: 'Portland, OR',
      ownerId: demoUser.id,
    },
    {
      title: 'Car Dashboard Camera',
      description: 'High-quality dash cam with 4K recording, night vision, and GPS. Used for 1 year, excellent condition. Includes 32GB SD card.',
      categoryId: categories[7].id, // Automotive
      priceCents: 12000, // $120
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'excellent',
      location: 'Miami, FL',
      ownerId: demoUser.id,
    },
    {
      title: 'MacBook Air M1 - 2020',
      description: 'MacBook Air with M1 chip, 8GB RAM, 256GB SSD. Lightly used for 8 months. Perfect for students and professionals.',
      categoryId: categories[0].id, // Electronics
      priceCents: 75000, // $750
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'excellent',
      location: 'San Francisco, CA',
      ownerId: demoUser.id,
    },
    {
      title: 'Designer Handbag - Coach',
      description: 'Vintage Coach handbag in brown leather. Classic style, some patina from age. Perfect for everyday use.',
      categoryId: categories[1].id, // Clothing
      priceCents: 18000, // $180
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      condition: 'good',
      location: 'Austin, TX',
      ownerId: demoUser.id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Sample products created:', sampleProducts.length);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
