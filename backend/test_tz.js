const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.$queryRaw`SELECT CONVERT_TZ('2026-09-13 19:15:00', '+00:00', '+05:30') AS d`;
  console.log('Result:', res);
  
  const report = await require('./modules/reports/reports.repository.js').getDailySalesReport(2026, 9);
  console.log('Calendar Data:', report);
}

main().finally(() => prisma.$disconnect());
