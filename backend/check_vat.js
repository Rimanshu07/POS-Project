const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      name: {
        in: ['Rampur Asava', '100 Pipers Whisky']
      }
    },
    select: {
      id: true,
      name: true,
      gst_type: true,
      gst_percentage: true
    }
  });
  console.log(products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
