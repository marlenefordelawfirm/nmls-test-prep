import './env-setup';

async function main() {
  // Dynamically import after environment is set up
  const { prisma } = await import('../src/lib/db');

  try {
    const contentAreas = await prisma.contentArea.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log('📊 Current Question Distribution:\n');
    let total = 0;

    const targets = {
      'federal-laws': 400,
      'general-knowledge': 400,
      'loan-origination': 400,
      'ethics': 400,
      'uniform-state': 400
    };

    for (const area of contentAreas) {
      const count = area._count.questions;
      total += count;
      const target = targets[area.id as keyof typeof targets] || 400;
      const needed = Math.max(0, target - count);

      console.log(`${area.name.padEnd(35)} ${count.toString().padStart(4)} / ${target} ${needed > 0 ? `(need ${needed})` : '✅'}`);
    }

    console.log(`${''.padEnd(35, '-')} ${''.padStart(4, '-')}`);
    console.log(`${'TOTAL'.padEnd(35)} ${total.toString().padStart(4)} / 2000\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
