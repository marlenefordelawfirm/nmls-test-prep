const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  try {
    const email = 'thedamdocta@gmail.com';
    const password = 'Admin@123';
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      // Update existing user to ADMIN role
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          passwordHash
        }
      });
      console.log('✅ Updated existing user to ADMIN:', updated.email);
      console.log('   Role:', updated.role);
    } else {
      // Create new admin user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: 'Admin User',
          role: 'ADMIN',
          subscriptionTier: 'ANNUAL'
        }
      });
      console.log('✅ Created new ADMIN user:', user.email);
      console.log('   Role:', user.role);
      console.log('   Tier:', user.subscriptionTier);
    }

    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
