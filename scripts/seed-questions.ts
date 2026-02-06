import { PrismaClient, Difficulty, BloomsLevel, CreatedBy } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Sample questions for each content area
const sampleQuestions = [
  // Federal Laws - TILA
  {
    contentAreaId: 'federal-laws',
    subTopicId: 'federal-laws-truth-in-lending-act-tila-',
    questionText: 'Which circumstance triggers a requirement to provide a new Closing Disclosure and wait an additional three business days before consummation?',
    optionA: 'The annual percentage rate (APR) increases by more than 1/8 of a percentage point',
    optionB: 'A seller\'s name change on the sales contract',
    optionC: 'Loan amount decrease from higher down payment',
    optionD: 'Typographical error correction in borrower\'s address',
    correctAnswer: 'A',
    explanation: 'Under TILA, if the APR increases by more than 1/8 of a percentage point for most loans (1/4 point for irregular transactions), a new Closing Disclosure must be provided and the three-business-day waiting period restarts.',
    difficulty: 'MEDIUM' as Difficulty,
    bloomsLevel: 'APPLY' as BloomsLevel
  },
  {
    contentAreaId: 'federal-laws',
    subTopicId: 'federal-laws-truth-in-lending-act-tila-',
    questionText: 'How many days before consummation must the Closing Disclosure be delivered to the borrower?',
    optionA: 'At least 3 business days',
    optionB: 'At least 7 business days',
    optionC: 'At least 3 calendar days',
    optionD: 'At least 5 business days',
    correctAnswer: 'A',
    explanation: 'The Closing Disclosure must be delivered to the borrower at least three business days before consummation under TILA-RESPA Integrated Disclosure (TRID) rules.',
    difficulty: 'EASY' as Difficulty,
    bloomsLevel: 'REMEMBER' as BloomsLevel
  },
  // Federal Laws - RESPA
  {
    contentAreaId: 'federal-laws',
    subTopicId: 'federal-laws-real-estate-settlement-procedures-act-respa-',
    questionText: 'Under RESPA, what is the maximum amount a lender can require a borrower to deposit into an escrow account at closing?',
    optionA: 'One-sixth of the estimated annual taxes and insurance',
    optionB: 'Two months of estimated taxes and insurance',
    optionC: 'Three months of estimated taxes and insurance',
    optionD: 'One month of estimated taxes and insurance',
    correctAnswer: 'B',
    explanation: 'RESPA allows lenders to collect a cushion of up to two months (1/6 of the annual amount) of taxes and insurance at closing for escrow accounts.',
    difficulty: 'MEDIUM' as Difficulty,
    bloomsLevel: 'UNDERSTAND' as BloomsLevel
  },
  // General Knowledge
  {
    contentAreaId: 'general-knowledge',
    subTopicId: 'general-knowledge-types-of-mortgages',
    questionText: 'What is the primary difference between a conventional loan and an FHA loan?',
    optionA: 'FHA loans are government-insured while conventional loans are not',
    optionB: 'Conventional loans have higher interest rates',
    optionC: 'FHA loans require 20% down payment',
    optionD: 'Conventional loans are only for first-time buyers',
    correctAnswer: 'A',
    explanation: 'FHA loans are insured by the Federal Housing Administration, which protects lenders against borrower default. Conventional loans are not government-insured or guaranteed.',
    difficulty: 'EASY' as Difficulty,
    bloomsLevel: 'UNDERSTAND' as BloomsLevel
  },
  {
    contentAreaId: 'general-knowledge',
    subTopicId: 'general-knowledge-debt-to-income-ratio',
    questionText: 'A borrower has a gross monthly income of $5,000. Their monthly debt payments include: mortgage payment $1,200, car loan $300, and credit card minimum payment $100. What is their debt-to-income (DTI) ratio?',
    optionA: '32%',
    optionB: '24%',
    optionC: '28%',
    optionD: '36%',
    correctAnswer: 'A',
    explanation: 'DTI is calculated by dividing total monthly debt payments by gross monthly income. ($1,200 + $300 + $100) / $5,000 = $1,600 / $5,000 = 0.32 or 32%.',
    difficulty: 'MEDIUM' as Difficulty,
    bloomsLevel: 'APPLY' as BloomsLevel
  },
  // Loan Origination
  {
    contentAreaId: 'loan-origination',
    subTopicId: 'loan-origination-loan-estimate-le-',
    questionText: 'Within how many business days after receiving a loan application must a lender provide a Loan Estimate to the borrower?',
    optionA: '3 business days',
    optionB: '5 business days',
    optionC: '7 business days',
    optionD: '10 business days',
    correctAnswer: 'A',
    explanation: 'Under TRID rules, lenders must provide the Loan Estimate within three business days of receiving a complete loan application.',
    difficulty: 'EASY' as Difficulty,
    bloomsLevel: 'REMEMBER' as BloomsLevel
  },
  {
    contentAreaId: 'loan-origination',
    subTopicId: 'loan-origination-income-verification',
    questionText: 'Which document is typically required to verify a self-employed borrower\'s income?',
    optionA: 'Two years of personal and business tax returns',
    optionB: 'One month of bank statements',
    optionC: 'A letter from their accountant',
    optionD: 'Their business license',
    correctAnswer: 'A',
    explanation: 'For self-employed borrowers, lenders typically require two years of personal tax returns and, if applicable, business tax returns to verify income stability and calculate qualifying income.',
    difficulty: 'MEDIUM' as Difficulty,
    bloomsLevel: 'UNDERSTAND' as BloomsLevel
  },
  // Ethics
  {
    contentAreaId: 'ethics',
    subTopicId: 'ethics-fraud-prevention',
    questionText: 'Which of the following is an example of occupancy fraud?',
    optionA: 'A borrower stating they will live in the property as their primary residence when they intend to rent it out',
    optionB: 'A borrower providing incorrect employment information',
    optionC: 'A lender charging excessive fees',
    optionD: 'An appraiser overvaluing a property',
    correctAnswer: 'A',
    explanation: 'Occupancy fraud occurs when a borrower misrepresents their intention to occupy the property as their primary residence. This is significant because owner-occupied properties typically receive better loan terms.',
    difficulty: 'EASY' as Difficulty,
    bloomsLevel: 'UNDERSTAND' as BloomsLevel
  },
  {
    contentAreaId: 'ethics',
    subTopicId: 'ethics-fair-lending-practices',
    questionText: 'Which law prohibits discrimination in lending based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance?',
    optionA: 'Equal Credit Opportunity Act (ECOA)',
    optionB: 'Fair Housing Act (FHA)',
    optionC: 'Truth in Lending Act (TILA)',
    optionD: 'Real Estate Settlement Procedures Act (RESPA)',
    correctAnswer: 'A',
    explanation: 'The Equal Credit Opportunity Act (ECOA) prohibits creditors from discriminating against credit applicants on these protected bases.',
    difficulty: 'EASY' as Difficulty,
    bloomsLevel: 'REMEMBER' as BloomsLevel
  },
  // Uniform State Content
  {
    contentAreaId: 'uniform-state',
    subTopicId: 'uniform-state-state-licensing-requirements',
    questionText: 'What is the purpose of the NMLS (Nationwide Multistate Licensing System)?',
    optionA: 'To provide a centralized platform for state licensing of mortgage loan originators',
    optionB: 'To regulate interest rates on mortgages',
    optionC: 'To insure mortgage loans',
    optionD: 'To set national lending standards',
    correctAnswer: 'A',
    explanation: 'The NMLS is a centralized system that allows mortgage loan originators to apply for, amend, update, and renew their licenses through a single platform, even though licensing is still done at the state level.',
    difficulty: 'EASY' as Difficulty,
    bloomsLevel: 'UNDERSTAND' as BloomsLevel
  }
];

async function main() {
  console.log('🌱 Starting question seeding...\n');

  console.log(`📝 Creating ${sampleQuestions.length} sample questions...\n`);

  for (const question of sampleQuestions) {
    const created = await prisma.question.create({
      data: {
        contentAreaId: question.contentAreaId,
        subTopicId: question.subTopicId,
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        bloomsLevel: question.bloomsLevel,
        createdBy: 'AI' as CreatedBy
      }
    });

    console.log(`   ✅ Created question: ${created.questionText.substring(0, 60)}...`);
  }

  // Get total counts by content area
  const counts = await prisma.question.groupBy({
    by: ['contentAreaId'],
    _count: true
  });

  console.log('\n📊 Questions created by content area:');
  for (const count of counts) {
    const area = await prisma.contentArea.findUnique({
      where: { id: count.contentAreaId }
    });
    console.log(`   ${area?.name}: ${count._count} questions`);
  }

  const totalQuestions = await prisma.question.count();
  console.log(`\n✅ Total questions: ${totalQuestions}\n`);
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
