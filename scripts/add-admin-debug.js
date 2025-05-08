// Script to add an admin user for debugging purposes
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting admin user creation script...');
  
  // Admin user details
  const admin = {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'Admin123!'
  };
  
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin.password, salt);
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: admin.email }
    });
    
    let adminUser;
    
    if (existingAdmin) {
      console.log(`Admin user ${admin.email} already exists, updating password...`);
      adminUser = await prisma.admin.update({
        where: { email: admin.email },
        data: { passwordHash: hashedPassword }
      });
    } else {
      console.log(`Creating new admin user: ${admin.email}`);
      adminUser = await prisma.admin.create({
        data: {
          email: admin.email,
          name: admin.name,
          passwordHash: hashedPassword
        }
      });
    }
    
    console.log('Admin user created/updated successfully:', adminUser);
    
    // Generate a valid token for testing
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-for-development";
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin' },
      ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('\nAdmin created successfully!');
    console.log('\nUse these credentials:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${admin.password}`);
    console.log('\nFor testing, you can manually set this valid token as a cookie:');
    console.log(`admin_token=${token}`);
    
    // Write the token to a file for easy access
    fs.writeFileSync('admin-token.txt', token);
    console.log('\nToken has been saved to admin-token.txt');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 