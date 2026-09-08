const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@almubarmaja.com';
  console.log(`Searching for user with email: ${email}`);
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`User not found. Creating a default verified user: ${email}`);
    
    // Hash is for password 'password123'
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Default Admin',
        email,
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        isActive: true
      }
    });
    console.log(`Success: Created default verified user!`);
    console.log(`Email:    ${email}`);
    console.log(`Password: password123`);
    return;
  }
  
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      isActive: true
    }
  });
  
  console.log(`Success: User "${email}" has been marked as VERIFIED and ACTIVE!`);
}

main()
  .catch(err => {
    console.error('Error running script:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
