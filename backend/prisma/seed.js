const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function seed() {
  const adminUsername = 'admin';
  const adminPassword = 'admin';

  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await prisma.user.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          fullName: 'مدیر سیستم',
          role: 'ADMIN',
          isProtected: true,
        },
      });
      console.log('کاربر ادیمین پیشفرض ایجاد شد.');
    }

    // Set default Ollama URL if not set
    const ollamaConfig = await prisma.systemConfig.findUnique({
      where: { key: 'OLLAMA_URL' },
    });

    if (!ollamaConfig) {
      await prisma.systemConfig.create({
        data: {
          key: 'OLLAMA_URL',
          value: 'http://localhost:11434',
        },
      });
      console.log('Default Ollama URL configured.');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

module.exports = seed;

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
