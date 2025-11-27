const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Default Admin User
  const adminUsername = 'admin';
  const adminPassword = 'adminpassword'; // Change this in production!
  
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
        role: 'ADMIN',
        fullName: 'System Administrator',
        isProtected: true, // Prevent deletion
      },
    });
    console.log(`Created admin user: ${adminUsername}`);
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Create Default System Config
  const defaultConfig = [
    { key: 'OLLAMA_URL', value: 'http://localhost:11434' },
  ];

  for (const config of defaultConfig) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: {
        key: config.key,
        value: config.value,
      },
    });
  }
  console.log('System configuration seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
