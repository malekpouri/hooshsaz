require('dotenv').config();
const app = require('./app');
const prisma = require('./utils/prisma');

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    // Check DB connection
    await prisma.$connect();
    console.log('Connected to Database');

    // Bootstrap (Auto-Seed)
    const bootstrap = require('./utils/bootstrap');
    await bootstrap();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
