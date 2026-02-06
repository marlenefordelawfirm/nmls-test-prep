/**
 * ThresholdUpdateService
 *
 * Fetches and updates financial thresholds from official government sources.
 * Should be run monthly (daily in Nov/Dec when annual limits are announced).
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ThresholdUpdate {
  key: string;
  oldValue: number;
  newValue: number;
  source: string;
}

interface UpdateResult {
  success: boolean;
  updatesFound: number;
  updatesApplied: number;
  updates: ThresholdUpdate[];
  errors: string[];
}

/**
 * Fetches current year for threshold updates
 */
function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Fetches conforming loan limits from FHFA
 * Source: https://www.fhfa.gov/DataTools/Downloads/Pages/Conforming-Loan-Limits.aspx
 *
 * Note: This is a placeholder implementation. In production, you would:
 * 1. Use FHFA's official API or RSS feed
 * 2. Parse their CSV/JSON data
 * 3. Handle county-specific limits
 */
async function fetchFHFALimits(year: number): Promise<Partial<Record<string, number>>> {
  try {
    // Placeholder: In production, fetch from FHFA API
    // Example: https://www.fhfa.gov/DataTools/Downloads/Documents/Conforming-Loan-Limits/FullCountyLoanLimitList2026.xlsx

    // For now, return empty - manual updates required
    // When implementing, use fetch() to get the official data
    console.log(`[ThresholdUpdate] Would fetch FHFA limits for ${year}`);

    return {};
  } catch (error) {
    console.error('[ThresholdUpdate] Error fetching FHFA limits:', error);
    throw new Error('Failed to fetch FHFA conforming loan limits');
  }
}

/**
 * Fetches FHA loan limits from HUD
 * Source: https://www.hud.gov/program_offices/housing/sfh/ins/203h
 */
async function fetchHUDLimits(year: number): Promise<Partial<Record<string, number>>> {
  try {
    // Placeholder: In production, fetch from HUD API
    console.log(`[ThresholdUpdate] Would fetch HUD FHA limits for ${year}`);

    return {};
  } catch (error) {
    console.error('[ThresholdUpdate] Error fetching HUD limits:', error);
    throw new Error('Failed to fetch HUD FHA loan limits');
  }
}

/**
 * Fetches regulatory thresholds from CFPB
 * Source: https://www.consumerfinance.gov/
 *
 * Note: HPML and QM thresholds rarely change, but should be monitored
 */
async function fetchCFPBThresholds(year: number): Promise<Partial<Record<string, number>>> {
  try {
    // Placeholder: In production, check CFPB regulations
    console.log(`[ThresholdUpdate] Would fetch CFPB thresholds for ${year}`);

    return {};
  } catch (error) {
    console.error('[ThresholdUpdate] Error fetching CFPB thresholds:', error);
    throw new Error('Failed to fetch CFPB regulatory thresholds');
  }
}

/**
 * Checks official sources for threshold updates
 */
async function checkForUpdates(year: number): Promise<UpdateResult> {
  const updates: ThresholdUpdate[] = [];
  const errors: string[] = [];

  try {
    // Fetch from all sources
    const [fhfaLimits, hudLimits, cfpbThresholds] = await Promise.allSettled([
      fetchFHFALimits(year),
      fetchHUDLimits(year),
      fetchCFPBThresholds(year)
    ]);

    // Process FHFA updates
    if (fhfaLimits.status === 'fulfilled') {
      const limits = fhfaLimits.value;

      for (const [key, newValue] of Object.entries(limits)) {
        const existing = await prisma.financialThreshold.findUnique({
          where: { key }
        });

        if (existing && existing.value !== newValue) {
          updates.push({
            key,
            oldValue: existing.value || 0,
            newValue: newValue || 0,
            source: 'FHFA (Federal Housing Finance Agency)'
          });
        }
      }
    } else {
      errors.push(`FHFA: ${fhfaLimits.reason}`);
    }

    // Process HUD updates
    if (hudLimits.status === 'fulfilled') {
      const limits = hudLimits.value;

      for (const [key, newValue] of Object.entries(limits)) {
        const existing = await prisma.financialThreshold.findUnique({
          where: { key }
        });

        if (existing && existing.value !== newValue) {
          updates.push({
            key,
            oldValue: existing.value || 0,
            newValue: newValue || 0,
            source: 'HUD (Department of Housing and Urban Development)'
          });
        }
      }
    } else {
      errors.push(`HUD: ${hudLimits.reason}`);
    }

    // Process CFPB updates
    if (cfpbThresholds.status === 'fulfilled') {
      const thresholds = cfpbThresholds.value;

      for (const [key, newValue] of Object.entries(thresholds)) {
        const existing = await prisma.financialThreshold.findUnique({
          where: { key }
        });

        if (existing && existing.value !== newValue) {
          updates.push({
            key,
            oldValue: existing.value || 0,
            newValue: newValue || 0,
            source: 'CFPB (Consumer Financial Protection Bureau)'
          });
        }
      }
    } else {
      errors.push(`CFPB: ${cfpbThresholds.reason}`);
    }

    return {
      success: true,
      updatesFound: updates.length,
      updatesApplied: 0,
      updates,
      errors
    };
  } catch (error) {
    console.error('[ThresholdUpdate] Error checking for updates:', error);
    return {
      success: false,
      updatesFound: 0,
      updatesApplied: 0,
      updates: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Applies threshold updates to the database
 */
async function applyUpdates(updates: ThresholdUpdate[]): Promise<number> {
  let appliedCount = 0;

  for (const update of updates) {
    try {
      await prisma.financialThreshold.update({
        where: { key: update.key },
        data: {
          value: update.newValue,
          lastUpdated: new Date()
        }
      });

      appliedCount++;
      console.log(`[ThresholdUpdate] Updated ${update.key}: ${update.oldValue} → ${update.newValue}`);
    } catch (error) {
      console.error(`[ThresholdUpdate] Failed to update ${update.key}:`, error);
    }
  }

  return appliedCount;
}

/**
 * Main function to check and update thresholds
 * This should be called by a cron job or API endpoint
 */
export async function updateFinancialThresholds(): Promise<UpdateResult> {
  console.log('[ThresholdUpdate] Starting threshold update check...');

  const year = getCurrentYear();
  const result = await checkForUpdates(year);

  if (result.updatesFound > 0) {
    console.log(`[ThresholdUpdate] Found ${result.updatesFound} updates to apply`);

    const appliedCount = await applyUpdates(result.updates);
    result.updatesApplied = appliedCount;

    console.log(`[ThresholdUpdate] Applied ${appliedCount}/${result.updatesFound} updates`);

    // TODO: Send notification email to admins
    // await sendThresholdUpdateNotification(result.updates);
  } else {
    console.log('[ThresholdUpdate] No updates found - all thresholds are current');
  }

  if (result.errors.length > 0) {
    console.warn('[ThresholdUpdate] Errors encountered:', result.errors);
    // TODO: Send error notification to admins
  }

  return result;
}

/**
 * Get update schedule recommendation based on current date
 * Returns true if today is a good day to check for updates
 */
export function shouldCheckForUpdates(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const dayOfMonth = now.getDate();

  // November (10) and December (11): Check daily
  // These are months when annual limits are typically announced
  if (month === 10 || month === 11) {
    return true;
  }

  // Other months: Check on the 1st of the month
  if (dayOfMonth === 1) {
    return true;
  }

  return false;
}

/**
 * Get last update time for all thresholds
 */
export async function getLastUpdateTime(): Promise<Date | null> {
  const mostRecent = await prisma.financialThreshold.findFirst({
    orderBy: { lastUpdated: 'desc' },
    select: { lastUpdated: true }
  });

  return mostRecent?.lastUpdated || null;
}

export type { ThresholdUpdate, UpdateResult };
