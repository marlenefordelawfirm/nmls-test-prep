/**
 * Script to trigger batch processing via admin API
 * This authenticates as admin and calls the knowledge base processing endpoint
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'thedamdocta@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Triggering Batch Processing via Admin API    ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Login to get session cookie
    console.log('📝 Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        callbackUrl: `${BASE_URL}/dashboard`,
        json: 'true'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    // Get session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    if (!cookies) {
      throw new Error('No session cookie received');
    }

    console.log('✅ Logged in successfully\n');

    // Step 2: Trigger batch processing
    console.log('🚀 Starting batch processing...');
    console.log('⏳ This will take 15-30 minutes to generate 2000 questions\n');

    const processResponse = await fetch(`${BASE_URL}/api/admin/knowledge-base/process`, {
      method: 'POST',
      headers: {
        'Cookie': cookies
      }
    });

    if (!processResponse.ok) {
      const errorData = await processResponse.json();
      throw new Error(`Processing failed: ${JSON.stringify(errorData)}`);
    }

    const result = await processResponse.json();

    if (result.success) {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║  Processing Complete!                          ║');
      console.log('╚════════════════════════════════════════════════╝\n');

      console.log(`✅ Sections processed: ${result.result.sectionsProcessed}`);
      console.log(`✅ Questions generated: ${result.result.questionsGenerated}`);

      console.log(`\n📈 Questions by style:`);
      Object.entries(result.result.questionsByStyle || {}).forEach(([style, count]) => {
        console.log(`   ${style.padEnd(15)}: ${count}`);
      });

      console.log(`\n📊 Database stats:`);
      console.log(`   Total questions: ${result.result.statsAfter.totalQuestions}`);
      console.log(`   New questions: +${result.result.questionsGenerated}`);
    } else {
      console.error('❌ Processing failed:', result.error);
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
