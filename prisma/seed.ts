import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load environment variables from .env.local
const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or DATABASE_URL_UNPOOLED must be set');
}

console.log(`🔌 Connecting to database: ${DATABASE_URL.split('@')[1]?.split('/')[1] || 'unknown'}\n`);

const pool = new Pool({
  connectionString: DATABASE_URL
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

const financialThresholds = [
  {
    key: 'CONFORMING_LOAN_LIMIT_2026_SINGLE_FAMILY',
    value: 806500,
    year: 2026,
    source: 'FHFA (Federal Housing Finance Agency)',
  },
  {
    key: 'CONFORMING_LOAN_LIMIT_2026_HIGH_COST',
    value: 1209750,
    year: 2026,
    source: 'FHFA (Federal Housing Finance Agency)',
  },
  {
    key: 'FHA_LOAN_LIMIT_2026_LOW_COST',
    value: 498257,
    year: 2026,
    source: 'HUD (Department of Housing and Urban Development)',
  },
  {
    key: 'FHA_LOAN_LIMIT_2026_HIGH_COST',
    value: 1209750,
    year: 2026,
    source: 'HUD (Department of Housing and Urban Development)',
  },
  {
    key: 'VA_LOAN_LIMIT_2026',
    value: 806500,
    year: 2026,
    source: 'VA (Department of Veterans Affairs)',
  },
  {
    key: 'JUMBO_LOAN_THRESHOLD_2026',
    value: 806500,
    year: 2026,
    source: 'FHFA (Federal Housing Finance Agency)',
  },
  {
    key: 'HPML_APR_THRESHOLD_FIRST_LIEN',
    value: 1.5,
    year: 2026,
    source: 'CFPB (Consumer Financial Protection Bureau)',
  },
  {
    key: 'HPML_APR_THRESHOLD_SUBORDINATE_LIEN',
    value: 3.5,
    year: 2026,
    source: 'CFPB (Consumer Financial Protection Bureau)',
  },
  {
    key: 'QM_DTI_THRESHOLD',
    value: 43,
    year: 2026,
    source: 'CFPB (Consumer Financial Protection Bureau)',
  },
  {
    key: 'QM_POINTS_FEES_THRESHOLD_LOAN_AMOUNT_100K_PLUS',
    value: 3,
    year: 2026,
    source: 'CFPB (Consumer Financial Protection Bureau)',
  },
  {
    key: 'FHA_UPFRONT_MIP_RATE',
    value: 1.75,
    year: 2026,
    source: 'HUD (Department of Housing and Urban Development)',
  },
  {
    key: 'FHA_ANNUAL_MIP_RATE_LTV_95_PLUS',
    value: 0.85,
    year: 2026,
    source: 'HUD (Department of Housing and Urban Development)',
  },
];

async function main() {
  console.log('🌱 Starting financial threshold seed...\n');

  // Check if content areas exist
  const contentAreaCount = await prisma.contentArea.count();
  if (contentAreaCount === 0) {
    console.log('⚠️  No content areas found. Creating content areas and sub-topics...\n');

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
              description: subTopic.description,
              keywords: []
            }))
          }
        }
      });

      console.log(`   ✅ Created ${area.subTopics.length} sub-topics\n`);
    }
  } else {
    console.log(`✅ Found ${contentAreaCount} existing content areas, skipping creation\n`);
  }

  // Create or update financial thresholds
  console.log('💰 Creating/updating financial thresholds for 2026...');
  let createdCount = 0;
  let updatedCount = 0;

  for (const threshold of financialThresholds) {
    const existing = await prisma.financialThreshold.findUnique({
      where: { key: threshold.key }
    });

    if (existing) {
      await prisma.financialThreshold.update({
        where: { key: threshold.key },
        data: {
          value: threshold.value,
          year: threshold.year,
          source: threshold.source,
          lastUpdated: new Date(),
        },
      });
      updatedCount++;
    } else {
      await prisma.financialThreshold.create({
        data: threshold,
      });
      createdCount++;
    }
  }

  const thresholdCount = await prisma.financialThreshold.count();
  console.log(`   ✅ Created ${createdCount} new thresholds, updated ${updatedCount} existing`);
  console.log(`   📊 Total thresholds: ${thresholdCount}\n`);

  // Get final counts
  const finalContentAreaCount = await prisma.contentArea.count();
  const subTopicCount = await prisma.subTopic.count();
  const finalThresholdCount = await prisma.financialThreshold.count();

  console.log('📊 Seeding complete!');
  console.log(`   Content Areas: ${finalContentAreaCount}`);
  console.log(`   Sub-Topics: ${subTopicCount}`);
  console.log(`   Financial Thresholds: ${finalThresholdCount}\n`);
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
