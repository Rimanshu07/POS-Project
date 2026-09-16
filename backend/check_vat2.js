const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      gst_type: true,
      gst_percentage: true
    },
    take: 10
  });
  console.log(products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
