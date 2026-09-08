require('dotenv').config();
const app = require('./app');
const port = process.env.PORT || 5000;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('Database connected successfully!');
    app.listen(port, () => console.log(`Server running on port ${port} at ${new Date().toLocaleString()}`));
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
