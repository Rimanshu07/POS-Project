const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { seedMenu } = require('./seed_menu');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // DEVELOPMENT ONLY - WARNING: Change these passwords in production
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  console.log('Seeding users...');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@example.com',
      username: 'admin',
      password_hash: passwordHash,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Store Manager',
      email: 'manager@example.com',
      username: 'manager',
      password_hash: passwordHash,
      role: 'MANAGER',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@example.com' },
    update: {},
    create: {
      name: 'Main Cashier',
      email: 'cashier@example.com',
      username: 'cashier',
      password_hash: passwordHash,
      role: 'CASHIER',
    },
  });

  console.log('Seeding categories...');

  const catNames = ['Burgers', 'Pizzas', 'Beverages', 'Desserts', 'Sides', 'Salads'];
  const categories = [];
  
  for (let i = 0; i < catNames.length; i++) {
    const name = catNames[i];
    const slug = name.toLowerCase().replace(/ /g, '-');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
      },
    });
    categories.push(cat);
  }

  console.log('Seeding products...');

  const productsData = [
    { name: 'Classic Cheeseburger', catIndex: 0, price: 5.99 },
    { name: 'Double Bacon Burger', catIndex: 0, price: 7.99 },
    { name: 'Spicy Chicken Burger', catIndex: 0, price: 6.49 },
    { name: 'Margherita Pizza', catIndex: 1, price: 9.99 },
    { name: 'Pepperoni Pizza', catIndex: 1, price: 11.99 },
    { name: 'Vegetarian Pizza', catIndex: 1, price: 10.99 },
    { name: 'Cola', catIndex: 2, price: 1.99 },
    { name: 'Lemonade', catIndex: 2, price: 2.49 },
    { name: 'Iced Tea', catIndex: 2, price: 2.29 },
    { name: 'Chocolate Cake', catIndex: 3, price: 4.99 },
    { name: 'Vanilla Ice Cream', catIndex: 3, price: 3.49 },
    { name: 'French Fries', catIndex: 4, price: 2.99 },
    { name: 'Onion Rings', catIndex: 4, price: 3.99 },
    { name: 'Caesar Salad', catIndex: 5, price: 5.49 },
    { name: 'Greek Salad', catIndex: 5, price: 6.49 },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.catIndex + 1 },
      update: {},
      create: {
        name: p.name,
        price: p.price,
        category_id: categories[p.catIndex].id,
        description: 'Delicious ' + p.name.toLowerCase(),
      },
    });
  }

  // Seed Granular Menu Data (Bar Menu + Food Menu)
  await seedMenu();

  console.log('Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
