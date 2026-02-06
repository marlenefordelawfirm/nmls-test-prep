import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const contentAreas = [
  {
    id: 'federal-laws',
    name: 'Federal Mortgage-Related Laws',
    description: 'TILA, RESPA, ECOA, SAFE Act, and other federal regulations',
    percentageOfExam: 23,
    sortOrder: 1,
    subTopics: [
      { name: 'Truth in Lending Act (TILA)', description: 'Federal law requiring lenders to disclose loan terms and costs' },
      { name: 'Real Estate Settlement Procedures Act (RESPA)', description: 'Federal law governing settlement procedures and disclosure requirements' },
      { name: 'Equal Credit Opportunity Act (ECOA)', description: 'Federal law prohibiting discrimination in credit transactions' },
      { name: 'SAFE Mortgage Licensing Act', description: 'Federal law establishing minimum standards for mortgage loan originator licensing' },
      { name: 'Fair Housing Act', description: 'Federal law prohibiting discrimination in housing-related activities' },
      { name: 'Home Mortgage Disclosure Act (HMDA)', description: 'Federal law requiring reporting of mortgage lending data' },
      { name: 'Fair Credit Reporting Act (FCRA)', description: 'Federal law regulating the collection and use of consumer credit information' },
      { name: 'Gramm-Leach-Bliley Act (GLBA)', description: 'Federal law governing financial privacy and data security' },
    ]
  },
  {
    id: 'general-knowledge',
    name: 'General Mortgage Knowledge',
    description: 'Mortgage products, underwriting, and industry practices',
    percentageOfExam: 23,
    sortOrder: 2,
    subTopics: [
      { name: 'Types of Mortgages', description: 'Overview of conventional, FHA, VA, and other mortgage products' },
      { name: 'Underwriting Process', description: 'Evaluation of borrower creditworthiness and loan risk' },
      { name: 'Credit Reports and Scores', description: 'Understanding credit reporting and scoring systems' },
      { name: 'Property Appraisal', description: 'Methods and requirements for property valuation' },
      { name: 'Mortgage Insurance', description: 'PMI, MIP, and other mortgage insurance requirements' },
      { name: 'Interest Rates and APR', description: 'Understanding interest rate types and annual percentage rate calculations' },
      { name: 'Loan-to-Value Ratio', description: 'Calculating and understanding LTV requirements' },
      { name: 'Debt-to-Income Ratio', description: 'Calculating and evaluating borrower debt ratios' },
    ]
  },
  {
    id: 'loan-origination',
    name: 'Mortgage Loan Origination Activities',
    description: 'Application process, documentation, and origination activities',
    percentageOfExam: 23,
    sortOrder: 3,
    subTopics: [
      { name: 'Loan Application Process', description: 'Steps in taking and processing a mortgage application' },
      { name: 'Required Documentation', description: 'Income, asset, and identity verification documents' },
      { name: 'Income Verification', description: 'Methods for verifying employment and income' },
      { name: 'Asset Verification', description: 'Documenting and verifying borrower assets' },
      { name: 'Loan Estimate (LE)', description: 'TILA-RESPA Integrated Disclosure requirements and timing' },
      { name: 'Closing Disclosure (CD)', description: 'Final disclosure requirements and delivery timeframes' },
      { name: 'Loan Processing', description: 'Steps from application to closing' },
      { name: 'Quality Control', description: 'Post-closing quality assurance procedures' },
    ]
  },
  {
    id: 'ethics',
    name: 'Ethics',
    description: 'Professional conduct and ethical standards in mortgage lending',
    percentageOfExam: 16,
    sortOrder: 4,
    subTopics: [
      { name: 'Conflicts of Interest', description: 'Identifying and managing potential conflicts' },
      { name: 'Fair Lending Practices', description: 'Ensuring equal treatment of all borrowers' },
      { name: 'Consumer Privacy', description: 'Protecting borrower personal and financial information' },
      { name: 'Fraud Prevention', description: 'Recognizing and preventing mortgage fraud' },
      { name: 'Professional Responsibility', description: 'Duties and obligations of mortgage professionals' },
      { name: 'Advertising and Marketing', description: 'Truth in advertising and compliant marketing practices' },
      { name: 'Compensation Rules', description: 'Loan originator compensation restrictions and requirements' },
    ]
  },
  {
    id: 'uniform-state',
    name: 'Uniform State Content',
    description: 'State-specific regulations and requirements',
    percentageOfExam: 15,
    sortOrder: 5,
    subTopics: [
      { name: 'State Licensing Requirements', description: 'State-specific licensing and registration requirements' },
      { name: 'State-Specific Regulations', description: 'Additional state mortgage lending laws' },
      { name: 'Foreclosure Laws', description: 'State foreclosure procedures and requirements' },
      { name: 'Property Taxes', description: 'State and local property tax regulations' },
      { name: 'Recording and Filing', description: 'State requirements for document recording' },
    ]
  }
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.question.deleteMany({});
  await prisma.subTopic.deleteMany({});
  await prisma.contentArea.deleteMany({});
  console.log('✅ Existing data cleared\n');

  // Create content areas and sub-topics
  for (const area of contentAreas) {
    console.log(`📚 Creating content area: ${area.name}`);

    await prisma.contentArea.create({
      data: {
        id: area.id,
        name: area.name,
        description: area.description,
        percentageOfExam: area.percentageOfExam,
        sortOrder: area.sortOrder,
        subTopics: {
          create: area.subTopics.map(subTopic => ({
            id: `${area.id}-${subTopic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: subTopic.name,
            description: subTopic.description
          }))
        }
      }
    });

    console.log(`   ✅ Created ${area.subTopics.length} sub-topics\n`);
  }

  // Get total counts
  const contentAreaCount = await prisma.contentArea.count();
  const subTopicCount = await prisma.subTopic.count();

  console.log('📊 Seeding complete!');
  console.log(`   Content Areas: ${contentAreaCount}`);
  console.log(`   Sub-Topics: ${subTopicCount}\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
