import { PrismaClient, EmployeeRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');

    // Delete existing employees
    await prisma.employee.deleteMany({});
    console.log('Deleted existing employees');

    // Create manager employee
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    await prisma.employee.create({
      data: {
        name: 'John Manager',
        email: 'manager@wecargo.com',
        passwordHash: managerPasswordHash,
        phoneNumber: '+1234567890',
        address: '123 Manager Street, Business District',
        role: EmployeeRole.MANAGER,
        isActive: true,
        joinDate: new Date('2023-01-15'),
      },
    });
    console.log('Created manager employee');

    // Create delivery employee 1
    const delivery1PasswordHash = await bcrypt.hash('delivery123', 10);
    await prisma.employee.create({
      data: {
        name: 'Sam Delivery',
        email: 'delivery@wecargo.com',
        passwordHash: delivery1PasswordHash,
        phoneNumber: '+1987654321',
        address: '456 Delivery Avenue, Transport Zone',
        role: EmployeeRole.DELIVERY,
        isActive: true,
        joinDate: new Date('2023-02-20'),
      },
    });
    console.log('Created delivery employee 1');

    // Create delivery employee 2
    const delivery2PasswordHash = await bcrypt.hash('delivery456', 10);
    await prisma.employee.create({
      data: {
        name: 'Alex Courier',
        email: 'courier@wecargo.com',
        passwordHash: delivery2PasswordHash,
        phoneNumber: '+1555666777',
        address: '789 Courier Road, Delivery District',
        role: EmployeeRole.DELIVERY,
        isActive: true,
        joinDate: new Date('2023-03-10'),
      },
    });
    console.log('Created delivery employee 2');

    // Create inactive employee
    const inactivePasswordHash = await bcrypt.hash('inactive789', 10);
    await prisma.employee.create({
      data: {
        name: 'Former Employee',
        email: 'former@wecargo.com',
        passwordHash: inactivePasswordHash,
        phoneNumber: '+1333444555',
        address: '101 Past Lane, Exit Zone',
        role: EmployeeRole.DELIVERY,
        isActive: false,
        joinDate: new Date('2022-05-15'),
      },
    });
    console.log('Created inactive employee');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 