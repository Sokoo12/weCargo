// This script creates an admin user in the database
// Run with: node scripts/create-admin.js admin@example.com yourpassword

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node scripts/create-admin.js <email> <password>');
    process.exit(1);
  }

  const [email, password] = args;

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists!`);
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
      },
    });

    console.log(`Admin created successfully with email: ${admin.email}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    // Close Prisma connection
    await prisma.$disconnect();
  }
}

createAdmin(); 