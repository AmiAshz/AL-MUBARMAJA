const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n--- VANTARA TEST CREDENTIALS ---\n');

  // 1. Create or Find an Admin User
  const email = 'admin@vantara.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        name: 'Workshop Admin',
        email,
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('✅ Created new admin user:');
  } else {
    console.log('✅ Admin user found:');
  }
  console.log(`   Email:    ${email}`);
  console.log(`   Password: admin123\n`);

  // 2. Create or Find a Vehicle for Tracking
  let vehicle = await prisma.vehicle.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        jobNumber: `VNT-${Date.now().toString().slice(-6)}`,
        trackingCode: `VT-${Date.now().toString().slice(-4)}-TEST-1234`,
        make: 'Toyota',
        model: 'Innova',
        year: '2022',
        plateNumber: 'KL 10 AB 1234',
        ownerName: 'Ameena',
        ownerPhone: '+919876543210',
        dateBroughtIn: new Date(),
        status: 'IN_PROGRESS',
      },
    });
    console.log('✅ Created test vehicle:');
  } else {
    console.log('✅ Existing vehicle found in database:');
  }
  console.log(`   Tracking Code: ${vehicle.trackingCode}`);
  console.log(`   Phone Number:  ${vehicle.ownerPhone}`);
  
  console.log('\n--------------------------------\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
