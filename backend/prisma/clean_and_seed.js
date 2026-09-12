const { PrismaClient } = require('@prisma/client');
const { seedMenu } = require('./seed_menu');
const prisma = new PrismaClient();

async function cleanAndSeed() {
  console.log('--- STARTING OPTION A: FULL CLEAN RESET & FRESH SEED ---');

  // 1. Delete dependent transactional data in reverse foreign-key order
  console.log('Cleaning transactional order & payment records...');
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`✓ Cleared payments (${deletedPayments.count} records)`);

  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`✓ Cleared order items (${deletedOrderItems.count} records)`);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ Cleared orders (${deletedOrders.count} records)`);

  // 2. Delete products and categories
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`✓ Cleared old products (${deletedProducts.count} records)`);

  const deletedCategories = await prisma.category.deleteMany({});
  console.log(`✓ Cleared old categories (${deletedCategories.count} records)`);

  // 3. Reset MySQL auto-increment IDs for a completely clean sequence
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE products AUTO_INCREMENT = 1;');
    await prisma.$executeRawUnsafe('ALTER TABLE categories AUTO_INCREMENT = 1;');
    await prisma.$executeRawUnsafe('ALTER TABLE orders AUTO_INCREMENT = 1;');
    await prisma.$executeRawUnsafe('ALTER TABLE order_items AUTO_INCREMENT = 1;');
    await prisma.$executeRawUnsafe('ALTER TABLE payments AUTO_INCREMENT = 1;');
    console.log('✓ Reset table auto-increment counters to 1');
  } catch (err) {
    console.log('Note: Auto-increment reset skipped or handled by MySQL engine:', err.message);
  }

  // 4. Run the complete granular menu seeder
  console.log('\n--- SEEDING 100% FRESH GRANULAR MENU ---');
  await seedMenu();

  console.log('\n=============================================');
  console.log('🎉 OPTION A COMPLETED SUCCESSFULLY!');
  console.log('All dummy/test records removed.');
  console.log('Fresh categories and products seeded from ID 1.');
  console.log('=============================================');
}

cleanAndSeed()
  .catch((err) => {
    console.error('Error during clean and seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
