const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Default admin credentials - should be changed in production
  const email = 'admin@example.com';
  const password = 'Admin123!';

  try {
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
      }
    });

    console.log(`Admin created successfully with email: ${admin.email}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 