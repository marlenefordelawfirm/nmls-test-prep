/**
 * Targeted Question Generation Script
 * ONLY generates for lacking categories: Ethics, General Knowledge, Loan Origination
 */

import './env-setup';

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  NMLS Targeted Question Generation            ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // Dynamically import after environment is set up
  const { KnowledgeBaseService } = await import('../src/services/KnowledgeBaseService');
  const { prisma } = await import('../src/lib/db');

  try {
    // Check current distribution
    console.log('📊 Checking current distribution...\n');

    // Get counts for lacking categories
    const ethics = await prisma.question.count({
      where: { subTopic: { contentArea: { id: 'ethics' } } }
    });

    const generalKnowledge = await prisma.question.count({
      where: { subTopic: { contentArea: { id: 'general-knowledge' } } }
    });

    const loanOrigination = await prisma.question.count({
      where: { subTopic: { contentArea: { id: 'loan-origination' } } }
    });

    // Calculate needed amounts to reach 400 for each category
    const ethicsNeeded = Math.max(0, 400 - ethics);
    const generalNeeded = Math.max(0, 400 - generalKnowledge);
    const loanOrigNeeded = Math.max(0, 400 - loanOrigination);

    console.log('Current lacking categories:');
    console.log(`  Ethics: ${ethics} → need ${ethicsNeeded} to reach 400`);
    console.log(`  General Knowledge: ${generalKnowledge} → need ${generalNeeded} to reach 400`);
    console.log(`  Loan Origination: ${loanOrigination} → need ${loanOrigNeeded} to reach 400`);
    console.log('');

    // Define targeted content for each lacking category
    const targetedContent = [
      // ETHICS
      {
        category: 'ethics',
        contentAreaId: 'ethics',
        topics: [
          { name: 'Code of Ethics and Professional Conduct', content: 'NMLS Code of Ethics requires mortgage loan originators to maintain high standards of professional conduct, act with integrity, and prioritize client interests.' },
          { name: 'Fraud Prevention and Detection', content: 'Fraud prevention involves identifying red flags such as income falsification, undisclosed debt, occupancy fraud, and straw buyers. MLOs must verify all information.' },
          { name: 'Anti-Money Laundering (AML) Requirements', content: 'AML compliance requires MLOs to identify suspicious transactions, verify customer identity, and report cash transactions exceeding $10,000.' },
          { name: 'Fair Lending Practices and ECOA Compliance', content: 'Equal Credit Opportunity Act prohibits discrimination based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance.' },
          { name: 'Privacy and Information Security (GLBA)', content: 'Gramm-Leach-Bliley Act requires financial institutions to protect customer personal information and provide privacy notices.' },
          { name: 'Conflicts of Interest and Disclosure Requirements', content: 'MLOs must disclose conflicts of interest, referral fees, and any financial relationships that could influence loan decisions.' },
          { name: 'Mortgage Fraud Schemes', content: 'Common schemes include property flipping, straw buyers, occupancy fraud, silent seconds, and inflated appraisals.' },
          { name: 'Red Flags Rule and Identity Theft Prevention', content: 'Financial institutions must implement identity theft prevention programs to detect and respond to red flags of identity theft.' },
          { name: 'Professional Responsibility', content: 'MLOs are responsible for accurate loan disclosures, truthful advertising, proper licensing, and continuing education.' },
          { name: 'State Ethical Requirements', content: 'States may impose additional ethical standards, supervision requirements, and prohibited practices beyond federal regulations.' },
        ],
        count: ethicsNeeded,
        description: 'Ethics, professional conduct, and compliance requirements'
      },

      // GENERAL MORTGAGE KNOWLEDGE
      {
        category: 'general-knowledge',
        contentAreaId: 'general-knowledge',
        topics: [
          { name: 'FHA Loan Programs', content: 'FHA loans require minimum 3.5% down payment, allow lower credit scores (580+), require mortgage insurance premium (MIP), and have loan limits based on county.' },
          { name: 'VA Loan Programs', content: 'VA loans require no down payment, no mortgage insurance, have competitive interest rates, require VA funding fee, and borrower must have qualifying military service.' },
          { name: 'USDA Rural Development Loans', content: 'USDA loans require no down payment, are for rural/suburban areas, have income limits, require guarantee fee, and property must meet USDA location requirements.' },
          { name: 'Conventional Conforming Loans', content: 'Conventional loans meet Fannie Mae/Freddie Mac guidelines, have loan limits ($766,550 in 2024), require 5-20% down payment, and may require PMI if LTV > 80%.' },
          { name: 'Non-Conforming Jumbo Loans', content: 'Jumbo loans exceed conforming loan limits, require larger down payments (10-20%), higher credit scores (700+), and have stricter underwriting.' },
          { name: 'Mortgage Insurance', content: 'MIP (FHA), PMI (conventional), LPMI (lender-paid), and funding fee (VA) protect lenders against default. PMI cancels at 78% LTV or borrower request at 80% LTV.' },
          { name: 'Secondary Mortgage Market', content: 'Fannie Mae and Freddie Mac purchase mortgages from lenders, provide liquidity, set underwriting standards, and enable standardized loan products.' },
          { name: 'Fixed-Rate Mortgages', content: 'Fixed-rate mortgages have constant interest rates and payments for entire loan term. Common terms: 30-year (lower payment) and 15-year (less interest).' },
          { name: 'Adjustable Rate Mortgages (ARM)', content: 'ARMs have variable interest rates that adjust based on index + margin. Features include initial fixed period, adjustment caps, and lifetime caps.' },
          { name: 'Property Appraisal and Valuation', content: 'Appraisals determine fair market value using comparable sales, cost approach, or income approach. Required for most mortgage loans.' },
        ],
        count: generalNeeded,
        description: 'Mortgage programs, products, and market knowledge'
      },

      // MORTGAGE LOAN ORIGINATION
      {
        category: 'loan-origination',
        contentAreaId: 'loan-origination',
        topics: [
          { name: 'Loan Application and 1003 Form', content: 'Uniform Residential Loan Application (1003) collects borrower information: income, assets, debts, employment, property details, and declarations.' },
          { name: 'Borrower Qualification and Pre-Approval', content: 'Pre-qualification estimates borrowing capacity. Pre-approval verifies income, assets, credit, and provides conditional approval before house hunting.' },
          { name: 'Income Verification', content: 'Verify income using W-2s, pay stubs (30 days), tax returns (2 years), bank statements, and employment verification. Self-employed requires 2 years tax returns.' },
          { name: 'Asset Documentation', content: 'Document liquid assets (savings, checking), retirement accounts, gift funds, and verify large deposits. Seasoning requirements apply to certain assets.' },
          { name: 'Credit Analysis', content: 'Credit reports show payment history, outstanding debts, credit score, and public records. Minimum scores vary by loan program (FHA 580, conventional 620).' },
          { name: 'Automated Underwriting Systems', content: 'Desktop Underwriter (Fannie Mae) and Loan Prospector (Freddie Mac) provide automated approve/refer/deny decisions based on borrower profile.' },
          { name: 'Manual Underwriting', content: 'Manual underwriting analyzes credit history, compensating factors, residual income, and total debt-to-income for complex borrower situations.' },
          { name: 'Property Appraisal Ordering', content: 'Lenders order appraisals through appraisal management companies (AMCs) to ensure independence and USPAP compliance.' },
          { name: 'Loan Processing', content: 'Processors verify documents, order verifications, clear conditions, and prepare loan file for underwriting review.' },
          { name: 'Loan Estimate (TRID)', content: 'Loan Estimate provided within 3 business days of application, discloses loan terms, projected payments, closing costs, and cash to close.' },
          { name: 'Closing Disclosure (TRID)', content: 'Closing Disclosure provided at least 3 business days before closing, shows final loan terms, closing costs, and cash to close. Must match Loan Estimate or trigger new waiting period.' },
          { name: 'Quality Control', content: 'Post-closing QC reviews loan files for compliance, documentation accuracy, and fraud detection. Lenders audit percentage of funded loans.' },
        ],
        count: loanOrigNeeded,
        description: 'Loan origination activities, processing, and underwriting'
      }
    ];

    // Filter out categories that don't need questions
    const categoriesToGenerate = targetedContent.filter(t => t.count > 0);

    if (categoriesToGenerate.length === 0) {
      console.log('✅ All categories have sufficient questions!');
      await prisma.$disconnect();
      return;
    }

    console.log('🎯 Targeted Generation Plan:\n');
    for (const target of categoriesToGenerate) {
      console.log(`  ${target.category}: ${target.count} questions`);
      console.log(`     Topics: ${target.topics.length}`);
    }
    console.log('');

    // Generate questions for each category
    let totalGenerated = 0;
    const startTime = Date.now();

    for (const target of categoriesToGenerate) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📝 Generating ${target.count} questions for: ${target.category.toUpperCase()}`);
      console.log(`   ${target.description}`);
      console.log(`${'='.repeat(60)}\n`);

      // Get or create sub-topics for this category
      const contentArea = await prisma.contentArea.findUnique({
        where: { id: target.contentAreaId }
      });

      if (!contentArea) {
        console.error(`❌ Content area ${target.contentAreaId} not found!`);
        continue;
      }

      // Calculate questions per topic
      const questionsPerTopic = Math.ceil(target.count / target.topics.length);

      console.log(`   Generating ~${questionsPerTopic} questions per topic`);
      console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);
      console.log(`   Estimated time: ${Math.ceil(target.count / 10)} minutes\n`);

      let categoryGenerated = 0;

      // Generate questions for each topic (loop until target reached)
      while (categoryGenerated < target.count) {
        for (let i = 0; i < target.topics.length && categoryGenerated < target.count; i++) {
          const topic = target.topics[i];
          const remaining = target.count - categoryGenerated;

          // Generate 5 questions at a time (API limit)
          const toGenerate = Math.min(5, remaining);

          console.log(`   [${i + 1}/${target.topics.length}] ${topic.name} (batch of ${toGenerate}, total: ${categoryGenerated}/${target.count})...`);

          try {
            // Generate questions for this topic
            const questions = await KnowledgeBaseService.generateQuestionsFromSection(
              {
                topic: topic.name,
                content: topic.content,
                contentAreaId: target.contentAreaId
              },
              'scenario',
              toGenerate
            );

            if (questions.length === 0) {
              console.log(`      ⚠️  No questions generated`);
              continue;
            }

            // Get or create sub-topic
            let subTopic = await prisma.subTopic.findFirst({
              where: {
                name: topic.name,
                contentAreaId: target.contentAreaId
              }
            });

            if (!subTopic) {
              subTopic = await prisma.subTopic.create({
                data: {
                  name: topic.name,
                  description: topic.content.substring(0, 200),
                  contentAreaId: target.contentAreaId
                }
              });
            }

            // Save questions to database
            for (const q of questions) {
              try {
                await prisma.question.create({
                  data: {
                    contentAreaId: target.contentAreaId,
                    questionText: q.questionText,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    optionD: q.optionD,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    bloomsLevel: 'APPLY',
                    createdBy: 'AI',
                    subTopicId: subTopic.id
                  }
                });
                categoryGenerated++;
              } catch (err) {
                console.error(`      ❌ Failed to save question: ${err instanceof Error ? err.message : err}`);
              }
            }

            console.log(`      ✅ Saved ${questions.length} questions (${categoryGenerated}/${target.count})`);

          } catch (error) {
            console.error(`      ❌ Error generating questions: ${error instanceof Error ? error.message : error}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`\n✅ ${target.category} complete: ${categoryGenerated} questions generated`);
      totalGenerated += categoryGenerated;
    }

    const endTime = Date.now();
    const duration = Math.ceil((endTime - startTime) / 1000 / 60);

    console.log('\n');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  GENERATION COMPLETE                           ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log(`✅ Total questions generated: ${totalGenerated}`);
    console.log(`⏱️  Time taken: ${duration} minutes`);

    // Final distribution check
    console.log('\n📊 Final Distribution:\n');

    const contentAreas = await prisma.contentArea.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    let finalTotal = 0;
    for (const area of contentAreas) {
      const count = area._count.questions;
      finalTotal += count;
      const status = count >= 400 ? '✅' : `(need ${400 - count})`;
      console.log(`${area.name.padEnd(35)} ${count.toString().padStart(4)} / 400 ${status}`);
    }
    console.log(`${''.padEnd(35, '-')} ${''.padStart(4, '-')}`);
    console.log(`${'TOTAL'.padEnd(35)} ${finalTotal.toString().padStart(4)} questions\n`);

    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
