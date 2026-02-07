import './env-setup';
import bcrypt from 'bcryptjs';

async function main() {
  const { prisma } = await import('../src/lib/db');

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (existing) {
      console.log('✅ Admin user already exists:', existing.email);
      await prisma.$disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        subscriptionTier: 'ANNUAL'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Password: AdminPassword123!');
    console.log('   Role:', admin.role);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
