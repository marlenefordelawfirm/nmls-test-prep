require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testLogin() {
  try {
    console.log('🔍 Testing login with admin credentials...\n');

    const email = 'thedamdocta@gmail.com';
    const password = 'Admin@123';

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found in database');
      console.log('Creating admin user...');

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: 'Admin User',
          role: 'ADMIN',
          subscriptionTier: 'ANNUAL'
        }
      });

      console.log('✅ Admin user created:', newUser.email);
      console.log('   Role:', newUser.role);

    } else {
      console.log('✅ User found:', user.email);
      console.log('   Role:', user.role);
      console.log('   Has password hash:', !!user.passwordHash);

      // Test password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      console.log('   Password valid:', isValid);

      if (!isValid) {
        console.log('\n⚠️  Password does not match! Updating password...');
        const newPasswordHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { email },
          data: { passwordHash: newPasswordHash }
        });
        console.log('✅ Password updated successfully');
      }
    }

    await prisma.$disconnect();
    await pool.end();
    console.log('\n✅ Login test complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }
}

testLogin();
