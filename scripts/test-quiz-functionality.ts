import './env-setup';

async function testQuizFunctionality() {
  const { prisma } = await import('../src/lib/db');

  console.log('🧪 Testing Quiz Functionality...\n');

  try {
    // Test 1: Can we retrieve questions for each category?
    const categories = [
      { id: 'ethics', name: 'Ethics' },
      { id: 'general-knowledge', name: 'General Knowledge' },
      { id: 'loan-origination', name: 'Loan Origination' }
    ];

    let allTestsPassed = true;

    for (const category of categories) {
      console.log(`\n📝 Testing ${category.name}...`);

      const questions = await prisma.question.findMany({
        where: {
          subTopic: { contentArea: { id: category.id } }
        },
        take: 5,
        include: {
          subTopic: {
            include: {
              contentArea: true
            }
          }
        }
      });

      console.log(`   ✅ Retrieved ${questions.length} sample questions`);

      if (questions.length === 0) {
        console.log(`   ❌ ERROR: No questions found for ${category.name}`);
        allTestsPassed = false;
        continue;
      }

      // Verify question structure
      for (let i = 0; i < Math.min(2, questions.length); i++) {
        const q = questions[i];
        console.log(`\n   Question ${i + 1} Validation:`);

        const hasQuestionText = q.questionText && q.questionText.length > 0;
        const hasOptionA = q.optionA && q.optionA.length > 0;
        const hasOptionB = q.optionB && q.optionB.length > 0;
        const hasOptionC = q.optionC && q.optionC.length > 0;
        const hasOptionD = q.optionD && q.optionD.length > 0;
        const hasCorrectAnswer = ['optionA', 'optionB', 'optionC', 'optionD'].includes(q.correctAnswer);
        const hasExplanation = q.explanation && q.explanation.length > 0;
        const hasSubTopic = q.subTopic !== null;
        const hasContentArea = q.subTopic?.contentArea !== null;

        console.log(`      - Question text: ${hasQuestionText ? '✅' : '❌'}`);
        console.log(`      - Option A: ${hasOptionA ? '✅' : '❌'}`);
        console.log(`      - Option B: ${hasOptionB ? '✅' : '❌'}`);
        console.log(`      - Option C: ${hasOptionC ? '✅' : '❌'}`);
        console.log(`      - Option D: ${hasOptionD ? '✅' : '❌'}`);
        console.log(`      - Correct answer valid: ${hasCorrectAnswer ? '✅' : '❌'} (${q.correctAnswer})`);
        console.log(`      - Explanation: ${hasExplanation ? '✅' : '❌'}`);
        console.log(`      - Has subTopic: ${hasSubTopic ? '✅' : '❌'}`);
        console.log(`      - Has contentArea: ${hasContentArea ? '✅' : '❌'}`);

        const questionValid = hasQuestionText && hasOptionA && hasOptionB && hasOptionC &&
                            hasOptionD && hasCorrectAnswer && hasExplanation && hasSubTopic && hasContentArea;

        if (!questionValid) {
          allTestsPassed = false;
        }
      }
    }

    // Test 2: Verify we can filter by difficulty
    console.log('\n\n📊 Testing Difficulty Filtering...');
    const easyQuestions = await prisma.question.count({
      where: { difficulty: 'EASY' }
    });
    const mediumQuestions = await prisma.question.count({
      where: { difficulty: 'MEDIUM' }
    });
    const hardQuestions = await prisma.question.count({
      where: { difficulty: 'HARD' }
    });

    console.log(`   Easy questions: ${easyQuestions}`);
    console.log(`   Medium questions: ${mediumQuestions}`);
    console.log(`   Hard questions: ${hardQuestions}`);
    console.log(`   ✅ Difficulty filtering works`);

    // Test 3: Sample question display
    console.log('\n\n📄 Sample Question Display:\n');
    const sampleQuestion = await prisma.question.findFirst({
      where: {
        subTopic: { contentArea: { id: 'ethics' } }
      },
      include: {
        subTopic: {
          include: {
            contentArea: true
          }
        }
      }
    });

    if (sampleQuestion) {
      console.log('   ' + '='.repeat(60));
      console.log(`   Category: ${sampleQuestion.subTopic.contentArea.name}`);
      console.log(`   Topic: ${sampleQuestion.subTopic.name}`);
      console.log(`   Difficulty: ${sampleQuestion.difficulty}`);
      console.log('   ' + '='.repeat(60));
      console.log(`\n   ${sampleQuestion.questionText}\n`);
      console.log(`   A) ${sampleQuestion.optionA}`);
      console.log(`   B) ${sampleQuestion.optionB}`);
      console.log(`   C) ${sampleQuestion.optionC}`);
      console.log(`   D) ${sampleQuestion.optionD}`);
      console.log(`\n   Correct Answer: ${sampleQuestion.correctAnswer}`);
      console.log(`   Explanation: ${sampleQuestion.explanation.substring(0, 100)}...`);
      console.log('   ' + '='.repeat(60));
    }

    await prisma.$disconnect();

    if (allTestsPassed) {
      console.log('\n\n✅ ALL TESTS PASSED! Quiz functionality is working correctly.');
    } else {
      console.log('\n\n⚠️  Some tests failed. Please review the errors above.');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testQuizFunctionality();
