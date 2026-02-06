/**
 * Environment setup for scripts
 * Loads .env.local before any other imports
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const result = config({ path: resolve(process.cwd(), '.env.local') });

if (result.error) {
  console.error('Failed to load .env.local:', result.error);
  process.exit(1);
}

// Verify critical environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment');
  process.exit(1);
}

console.log('✅ Environment loaded successfully');
console.log(`   DATABASE: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
console.log(`   AI_PROVIDER: ${process.env.AI_PROVIDER || 'openai'}\n`);
